// 사용법: node server.js
// 발주서검증도구_웹.html의 "실시간 재고 다운로드" 버튼이 호출하는 로컬 전용 서버.
// 이 PC 안에서만 열려있고(localhost), 브라우저 요청이 오면 그때마다 WMS에 로그인해서
// 재고현황(화주x창고x로케이션별, 화주명="이그니스")을 조회해 xlsx로 응답한다.
// WMS 계정 정보는 이 서버가 도는 이 PC를 벗어나지 않는다 — 다른 사람 PC나 외부로 전송되지 않음.
//
// /kurly/orders 라우트: 컬리발주웹.html의 "취합" 버튼용 — 컬리 ESCM API는 브라우저에서 직접 fetch하면
// CORS로 막힐 가능성이 높아(내부 관리자 API라 임의 origin 허용 안 할 것으로 추정), 이 서버가 중계한다.
// 토큰은 사람이 입력하지 않고, 아래 getKurlyToken()이 디버깅모드 크롬에 로그인된 partner.kurly.com
// 탭에서 자동으로 캡처해온다(2026-09-10, 쿠팡발주웹 도구의 "로그인 세션 재사용" 방식을 참고해 도입).
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright-core');
const { WmsSession, loadEnv } = require('./wms_client.js');
const { buildWorkbook } = require('./stock_mapping.js');
// verify_core.js가 이 폴더에 없어도(원본 위치 미확인, 2026-09-14) 서버 전체가 죽지 않도록 방어적으로 로드.
// /ipgo/verify 라우트만 영향받고, 컬리발주웹/발주서검증도구 등 나머지 라우트는 정상 동작.
let runVerification = null;
try {
  ({ runVerification } = require('./verify_core.js'));
} catch (e) {
  console.error('[경고] verify_core.js를 찾을 수 없어 /ipgo/verify 라우트는 비활성화됩니다:', e.message);
}

const PORT = 8934;
const ORG_FILTER = '이그니스';

// 컬리 토큰 자동 캡처: 디버깅모드 크롬(포트 9334, 쿠팡 도구의 9333과 겹치지 않게 별도 포트)에
// partner.kurly.com이 로그인된 채로 열려있으면, 그 탭을 새로고침시켜서 자동 발생하는 API 요청의
// authorization 헤더를 가로채 토큰을 얻는다. 컬리 JWT는 1시간짜리라 50분 캐시 후 재캡처.
const KURLY_DEBUG_PORT = 9334;
const KURLY_CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const KURLY_CHROME_PROFILE = path.join(os.homedir(), 'ChromeDebugProfileKurly');
const KURLY_TOKEN_TTL_MS = 50 * 60 * 1000;

let cachedKurlyToken = null;
let cachedKurlyTokenAt = 0;

function isKurlyDebugChromeRunning() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${KURLY_DEBUG_PORT}/json/version`, { timeout: 1500 }, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

async function launchKurlyDebugChrome() {
  if (await isKurlyDebugChromeRunning()) return { alreadyRunning: true, launched: false };
  fs.mkdirSync(KURLY_CHROME_PROFILE, { recursive: true });
  spawn(
    KURLY_CHROME_PATH,
    [`--remote-debugging-port=${KURLY_DEBUG_PORT}`, `--user-data-dir=${KURLY_CHROME_PROFILE}`, 'https://partner.kurly.com'],
    { detached: true, stdio: 'ignore' },
  ).unref();
  return { alreadyRunning: false, launched: true };
}

// JWT는 서명 검증 없이 payload(exp)만 읽는다 — 만료된 토큰을 캡처했는지 걸러내기 위한 용도일 뿐,
// 인증 자체는 컬리 서버가 한다.
function decodeJwtExp(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch (e) {
    return null;
  }
}

async function getKurlyToken() {
  if (cachedKurlyToken && Date.now() - cachedKurlyTokenAt < KURLY_TOKEN_TTL_MS) {
    return cachedKurlyToken;
  }
  let browser;
  try {
    browser = await chromium.connectOverCDP(`http://localhost:${KURLY_DEBUG_PORT}`);
  } catch (e) {
    throw new Error('디버깅모드 크롬(9334)에 연결할 수 없습니다. "디버깅모드 크롬 열기" 버튼을 먼저 눌러주세요.');
  }
  try {
    let page = null;
    for (const ctx of browser.contexts()) {
      for (const pg of ctx.pages()) {
        if (pg.url().includes('partner.kurly.com')) { page = pg; break; }
      }
      if (page) break;
    }
    if (!page) {
      throw new Error('디버깅모드 크롬에 partner.kurly.com 탭이 없습니다. 그 탭을 열고 로그인한 뒤 다시 시도해주세요.');
    }
    // 컬리는 세션(로그인)이 만료되면 자동으로 재로그인되지 않고 #/login 화면으로 이동한다(쿠팡과 다른 점).
    // 그 상태에서 새로고침하면 브라우저에 남아있던 "이미 만료된" 토큰이 그대로 잡혀 401을 유발하므로,
    // (1) 로그인 화면으로의 이동을 폴링으로 감지하고 (2) 캡처한 토큰의 exp도 직접 확인해 걸러낸다.
    const token = await new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(finishTimeout, 10000);
      const poller = setInterval(() => { if (!settled && page.url().includes('/login')) finishLoginRedirect(); }, 500);

      function cleanup() {
        settled = true;
        clearTimeout(timer);
        clearInterval(poller);
        page.off('request', onRequest);
      }
      function finishTimeout() {
        if (settled) return;
        cleanup();
        reject(new Error('토큰 캡처 실패 — partner.kurly.com 탭이 로그인 상태인지 확인해주세요.'));
      }
      function finishLoginRedirect() {
        if (settled) return;
        cleanup();
        reject(new Error('컬리 세션이 만료되어 로그인 화면으로 이동했습니다. 디버깅모드 크롬 창에서 partner.kurly.com에 다시 로그인해주세요.'));
      }
      function onRequest(request) {
        if (settled) return;
        const auth = request.headers()['authorization'];
        if (!auth || !auth.startsWith('Bearer ')) return;
        const tok = auth.slice(7);
        const exp = decodeJwtExp(tok);
        if (exp && exp * 1000 <= Date.now()) return; // 만료된 토큰은 무시 — 곧 로그인 화면 감지가 뒤따를 것
        cleanup();
        resolve(tok);
      }
      page.on('request', onRequest);
      page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
    });
    cachedKurlyToken = token;
    cachedKurlyTokenAt = Date.now();
    return token;
  } finally {
    await browser.close(); // CDP 연결만 끊는다 — 실제 디버깅모드 크롬 창은 안 닫힘
  }
}

function findEnvPath() {
  const local = path.join(__dirname, '.env');
  if (fs.existsSync(local)) return local;
  const repoRoot = path.join(__dirname, '..', '..', '..', '.env');
  if (fs.existsSync(repoRoot)) return repoRoot;
  return local;
}

function withCors(res) {
  // file://로 연 페이지의 Origin은 "null"이라, 특정 origin 대신 '*'로 허용해야 fetch가 통과한다.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 5_000_000) req.destroy(new Error('요청 본문이 너무 큽니다.'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function handleStock(res) {
  const envPath = findEnvPath();
  if (!fs.existsSync(envPath)) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: '.env 파일을 찾지 못했습니다. wms-api 폴더에 WMS_USERNAME/WMS_PASSWORD를 채운 .env를 만들어주세요.' }));
    return;
  }
  const env = loadEnv(envPath);
  if (!env.WMS_USERNAME || !env.WMS_PASSWORD) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: `${envPath} 에 WMS_USERNAME / WMS_PASSWORD가 비어있습니다.` }));
    return;
  }

  try {
    const session = new WmsSession();
    await session.login(env.WMS_USERNAME, env.WMS_PASSWORD);
    const rows = await session.fetchStockByOrgWhLoc(ORG_FILTER);
    if (rows.length === 0) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: `화주="${ORG_FILTER}" 기준 조회 결과가 0건입니다. 계정 권한을 확인해주세요.` }));
      return;
    }
    const wb = await buildWorkbook(rows);
    const buf = await wb.xlsx.writeBuffer();
    res.writeHead(200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="realtime_stock.xlsx"',
      'X-Row-Count': String(rows.length),
    });
    res.end(buf);
    console.log(`[${new Date().toISOString()}] /stock.xlsx 응답 완료 (${rows.length}건)`);
  } catch (e) {
    console.error('에러:', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: e.message }));
  }
}

async function handleKurlyOrders(url, res) {
  const dateFrom = url.searchParams.get('from');
  const dateTo = url.searchParams.get('to') || dateFrom;
  if (!dateFrom) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'from 파라미터가 필요합니다.' }));
    return;
  }
  try {
    const token = await getKurlyToken();
    const params = new URLSearchParams({
      scheduledReceivingDateFrom: dateFrom,
      scheduledReceivingDateTo: dateTo,
      sortType: 'SCHEDULED_RECEIVING_DATE_ASC',
      limit: '50',
      currentPage: '1',
    });
    const kurlyUrl = `https://api.escm.kurly.com/api-purchase/v2/purchase-order-plan-goods/download/excel?${params.toString()}`;
    const kRes = await fetch(kurlyUrl, { headers: { authorization: `Bearer ${token}`, accept: '*/*' } });
    if (!kRes.ok) {
      const bodyText = (await kRes.text()).slice(0, 300);
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: `컬리 API 실패 HTTP ${kRes.status}: ${bodyText}` }));
      return;
    }
    const buf = Buffer.from(await kRes.arrayBuffer());
    res.writeHead(200, {
      // Node http 헤더는 한글 등 non-ASCII 문자를 값에 그대로 못 넣음(ERR_INVALID_CHAR) — 어차피
      // 브라우저 쪽(컬리발주웹.html)은 이 파일명을 안 쓰고 자체적으로 이름을 붙이므로 ASCII 고정값이면 충분.
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="kurly_orders_${dateFrom}.xlsx"`,
    });
    res.end(buf);
    console.log(`[${new Date().toISOString()}] /kurly/orders 응답 완료 (${dateFrom}~${dateTo}, ${buf.length} bytes)`);
  } catch (e) {
    console.error('에러:', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: e.message }));
  }
}

// /kurly/plan-goods-detail, /kurly/receiving-times, /kurly/plan-goods-patch 라우트: 컬리발주웹.html의
// "5. 소비기한 일괄 입력 및 발주 확정" 단계용 — 2026-08-25 세션에서 발견한 V2 API
// (particular-group/receiving-times/PATCH purchase-order-plan-goods)를 그대로 중계.
// PATCH는 실제 발주 데이터를 변경하는 쓰기 요청이니 유의 — 브라우저 쪽에서 사용자가 검토 후 실행한 요청만 전달됨.
const PLAN_GOODS_STATUSES = 'CREATED,ISSUED,CONFIRMED,WAITING_APPROVAL_SUPPLIER,WAITING_APPROVAL_KURLY,CANCELED';

async function handlePlanGoodsDetail(url, res) {
  const date = url.searchParams.get('date');
  const fulfillmentCenter = url.searchParams.get('fulfillmentCenter');
  if (!date || !fulfillmentCenter) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'date/fulfillmentCenter 파라미터가 필요합니다.' }));
    return;
  }
  try {
    const token = await getKurlyToken();
    const params = new URLSearchParams({
      scheduledReceivingDate: date,
      neoPurchaseOrderPlanGoodsStatuses: PLAN_GOODS_STATUSES,
      fulfillmentCenter,
      sortType: 'FULFILLMENT_CENTER_ASC',
    });
    const kurlyUrl = `https://api.escm.kurly.com/api-purchase/v2/purchase-order-plan-goods/particular-group?${params.toString()}`;
    const kRes = await fetch(kurlyUrl, { headers: { authorization: `Bearer ${token}`, accept: 'application/json' } });
    const text = await kRes.text();
    res.writeHead(kRes.ok ? 200 : 502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(text);
  } catch (e) {
    console.error('에러:', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: e.message }));
  }
}

async function handleReceivingTimes(url, res) {
  const date = url.searchParams.get('date');
  const dock = url.searchParams.get('dock');
  if (!date || !dock) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'date/dock 파라미터가 필요합니다.' }));
    return;
  }
  try {
    const token = await getKurlyToken();
    const params = new URLSearchParams({ scheduledReceivingDate: date, dock });
    const kurlyUrl = `https://api.escm.kurly.com/api-purchase/v2/purchase-order-plan-goods/receiving-times?${params.toString()}`;
    const kRes = await fetch(kurlyUrl, { headers: { authorization: `Bearer ${token}`, accept: 'application/json' } });
    const text = await kRes.text();
    res.writeHead(kRes.ok ? 200 : 502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(text);
  } catch (e) {
    console.error('에러:', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: e.message }));
  }
}

async function handlePlanGoodsPatch(req, res) {
  try {
    const bodyText = await readBody(req);
    let body;
    try { body = JSON.parse(bodyText); } catch { body = null; }
    const scheduledReceivingDate = body && body.scheduledReceivingDate;
    const updateGoodsList = body && body.updateGoodsList;
    if (!scheduledReceivingDate || !Array.isArray(updateGoodsList) || updateGoodsList.length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'scheduledReceivingDate/updateGoodsList(배열)가 필요합니다.' }));
      return;
    }
    const token = await getKurlyToken();
    const kRes = await fetch('https://api.escm.kurly.com/api-purchase/v2/purchase-order-plan-goods', {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ scheduledReceivingDate, updateGoodsList }),
    });
    const text = await kRes.text();
    res.writeHead(kRes.ok ? 200 : 502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(text);
    console.log(`[${new Date().toISOString()}] /kurly/plan-goods-patch 응답 완료 (${updateGoodsList.length}건, HTTP ${kRes.status})`);
  } catch (e) {
    console.error('에러:', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: e.message }));
  }
}

// /wms/outbound 라우트: 컬리발주웹.html의 "6. 입고 확정내역 검증" 단계용 — OTOO 출고현황(P200360, 품목별)을
// 거래처코드(기본값 컬리=01484)로 조회해서 중계. 재고현황/입고현황과 동일하게 매 요청마다 새 로그인.
async function handleWmsOutbound(url, res) {
  const dateFrom = url.searchParams.get('dateFrom');
  const dateTo = url.searchParams.get('dateTo') || dateFrom;
  const custCd = url.searchParams.get('custCd') || '01484';
  if (!dateFrom) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'dateFrom 파라미터가 필요합니다.' }));
    return;
  }
  const envPath = findEnvPath();
  const env = loadEnv(envPath);
  if (!env.WMS_USERNAME || !env.WMS_PASSWORD) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: `${envPath} 에 WMS_USERNAME / WMS_PASSWORD가 비어있습니다.` }));
    return;
  }
  try {
    const session = new WmsSession();
    await session.login(env.WMS_USERNAME, env.WMS_PASSWORD);
    const rows = await session.fetchOutboundByCustomer(dateFrom, dateTo, custCd);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ resultList: rows }));
    console.log(`[${new Date().toISOString()}] /wms/outbound 응답 완료 (${dateFrom}~${dateTo}, custCd=${custCd}, ${rows.length}건)`);
  } catch (e) {
    console.error('에러:', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: e.message }));
  }
}

// /kurly/plan-goods-list 라우트: 컬리발주웹.html의 "6. 입고 확정내역 검증" 단계용 — 입고예정일 기준 품목별
// 확정 수량/금액(plan-goods 리스트, particular-group보다 가벼운 조회 전용 엔드포인트)을 중계.
async function handleKurlyPlanGoodsList(url, res) {
  const dateFrom = url.searchParams.get('from');
  const dateTo = url.searchParams.get('to') || dateFrom;
  if (!dateFrom) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'from 파라미터가 필요합니다.' }));
    return;
  }
  try {
    const token = await getKurlyToken();
    const params = new URLSearchParams({
      scheduledReceivingDateFrom: dateFrom,
      scheduledReceivingDateTo: dateTo,
      limit: '500',
      currentPage: '1',
    });
    const kurlyUrl = `https://api.escm.kurly.com/api-purchase/v2/purchase-order-plan-goods?${params.toString()}`;
    const kRes = await fetch(kurlyUrl, { headers: { authorization: `Bearer ${token}`, accept: 'application/json' } });
    const text = await kRes.text();
    res.writeHead(kRes.ok ? 200 : 502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(text);
    console.log(`[${new Date().toISOString()}] /kurly/plan-goods-list 응답 완료 (${dateFrom}~${dateTo}, HTTP ${kRes.status})`);
  } catch (e) {
    console.error('에러:', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: e.message }));
  }
}

// /ipgo/verify 라우트: 이지로지스_입고검증_웹.html(G:드라이브 정본)의 "검증 실행" 버튼용 —
// 10-projects/4. 입고내역검증/webapp/server.js의 POST /api/verify와 완전히 동일한 로직(같은
// verify_core.js 공유)이지만, 이 공유 중계서버(8934, 다른 도구들과 동일 포트+프로토콜)에서도
// 응답하도록 추가함 — 팀원이 이미 등록해둔 startstockserver:// 프로토콜을 그대로 재사용 가능.
async function handleIpgoVerify(req, res) {
  if (!runVerification) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: 'verify_core.js를 찾지 못해 이 서버에서는 입고내역검증을 쓸 수 없습니다.' }));
    return;
  }
  try {
    const bodyText = await readBody(req);
    let input;
    try { input = JSON.parse(bodyText); } catch { input = null; }
    if (!input) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: '잘못된 요청 형식입니다.' }));
      return;
    }
    const { username, password, from, to } = input;
    const vendor = input.vendor || undefined;
    const org = input.org || '이그니스';
    const ambientGidOverride = input.ambientGid || undefined;
    if (!username || !password || !from || !to) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: 'WMS 아이디/비밀번호와 검증 기간(시작일/종료일)을 모두 입력해주세요.' }));
      return;
    }
    const { summary, workbook, fileName } = await runVerification({
      username, password, from, to, vendor, org, ambientGidOverride,
    });
    const buffer = await workbook.xlsx.writeBuffer();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      ok: true,
      summary,
      fileName,
      fileBase64: Buffer.from(buffer).toString('base64'),
    }));
    console.log(`[${new Date().toISOString()}] /ipgo/verify 응답 완료 (${summary.range}, 잔여차이 ${summary.residual})`);
  } catch (e) {
    console.error('에러:', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: e.message }));
  }
}

// /order-verify/save 라우트: 발주서검증도구_웹.html의 "검증완료 엑셀 다운로드" 버튼용 —
// G:드라이브 발주서/오프라인/{거래처명}/ 안에서 납품예정월(dueDateISO)과 일치하는 폴더를 찾아 그 안에
// 파일로 저장한다. 거래처마다 월 폴더 명명 규칙이 달라(예: 바디체리쉬는 "{거래처}_발주서_YY.MM",
// 메가마트는 "YYYY/YYYY.MM") 폴더를 새로 만들지는 않고, 기존 폴더 중 유일하게 일치하는 게 있을 때만
// 저장한다 — 못 찾으면 실패를 돌려줘서 호출 쪽(브라우저)이 기본 다운로드로 대체하게 한다.
const ORDER_VERIFY_ROOT = path.join('G:\\', '공유 드라이브', 'HQ_Team_SCM', '4.물류운영팀', 'SCM_물류운영', '발주서', '오프라인');

// WMS 거래처명은 "주식회사 유통닷컴"처럼 법인 표기가 붙지만, G:드라이브 폴더명은 "유통닷컴"처럼 약칭이라
// 그냥 공백만 지워서는 안 맞는 경우가 많다 — 법인 표기(주식회사/㈜/(주)/유한회사 등)를 지운 뒤 비교한다.
function normalizeVendor(s) {
  return String(s)
    .replace(/\(\s*주\s*\)|㈜|주식회사|\(\s*유\s*\)|유한회사|유한책임회사/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function findVendorDir(vendorName) {
  if (!fs.existsSync(ORDER_VERIFY_ROOT)) return null;
  const entries = fs.readdirSync(ORDER_VERIFY_ROOT, { withFileTypes: true }).filter((e) => e.isDirectory());
  let hit = entries.find((e) => e.name === vendorName);
  if (!hit) {
    const target = normalizeVendor(vendorName);
    hit = entries.find((e) => normalizeVendor(e.name) === target);
  }
  if (!hit) {
    // 정확히/정규화 일치가 없으면 포함 관계로 넓혀서 찾되, 후보가 둘 이상이면 잘못된 곳에 저장하는
    // 사고를 막기 위해 포기한다(null 반환 → 호출 쪽이 기본 다운로드로 대체).
    const target = normalizeVendor(vendorName);
    const contained = entries.filter((e) => {
      const n = normalizeVendor(e.name);
      return n.length > 0 && (target.includes(n) || n.includes(target));
    });
    if (contained.length === 1) hit = contained[0];
  }
  return hit ? path.join(ORDER_VERIFY_ROOT, hit.name) : null;
}

// vendorDir 아래 최대 2단계까지 훑어서, 경로 조각을 이어붙인 문자열에 목표 연/월이 인접하게
// 나타나는 폴더를 찾는다(예: "2026/2026.09", "거래처_발주서_25.10" 모두 매칈). 더 깊이(=더
// 구체적으로) 일치한 폴더를 우선한다.
function findMonthDirs(vendorDir, dueDateISO) {
  const d = new Date(dueDateISO);
  const yyyy = String(d.getFullYear());
  const yy = yyyy.slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const pattern = new RegExp(`(?:${yyyy}|${yy})[^0-9]{0,3}${mm}(?!\\d)`);

  const matches = [];
  function walk(dir, relParts, depth) {
    if (depth > 2) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const parts = relParts.concat(entry.name);
      if (pattern.test(parts.join('/'))) matches.push(path.join(dir, entry.name));
      walk(path.join(dir, entry.name), parts, depth + 1);
    }
  }
  walk(vendorDir, [], 1);
  matches.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);
  return matches;
}

async function handleOrderVerifySave(req, res) {
  try {
    const bodyText = await readBody(req);
    let body;
    try { body = JSON.parse(bodyText); } catch { body = null; }
    const fileBase64 = body && body.fileBase64;
    const fileName = body && body.fileName;
    const vendorName = body && body.vendorName;
    const dueDateISO = body && body.dueDateISO;
    if (!fileBase64 || !fileName || !vendorName || !dueDateISO) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: 'fileBase64/fileName/vendorName/dueDateISO가 모두 필요합니다.' }));
      return;
    }
    const vendorDir = findVendorDir(vendorName);
    if (!vendorDir) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: `거래처 폴더를 찾을 수 없습니다: "${vendorName}"` }));
      return;
    }
    const monthMatches = findMonthDirs(vendorDir, dueDateISO);
    if (monthMatches.length === 0) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: `"${vendorName}" 안에서 발주월(${dueDateISO.slice(0, 7)})에 맞는 폴더를 찾지 못했습니다.` }));
      return;
    }
    const targetDir = monthMatches[0];
    const filePath = path.join(targetDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(fileBase64, 'base64'));
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, savedPath: filePath }));
    console.log(`[${new Date().toISOString()}] /order-verify/save 응답 완료: ${filePath}`);
  } catch (e) {
    console.error('에러:', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: e.message }));
  }
}

async function loginWmsSession() {
  const envPath = findEnvPath();
  const env = loadEnv(envPath);
  if (!env.WMS_USERNAME || !env.WMS_PASSWORD) {
    throw new Error(`${envPath} 에 WMS_USERNAME / WMS_PASSWORD가 비어있습니다.`);
  }
  const session = new WmsSession();
  await session.login(env.WMS_USERNAME, env.WMS_PASSWORD);
  return session;
}

async function handleOrderVerifyWmsCheck(req, res) {
  try {
    const bodyText = await readBody(req);
    let body;
    try { body = JSON.parse(bodyText); } catch { body = null; }
    const orgcd = body && body.orgcd;
    const whcd = body && body.whcd;
    const rows = body && body.rows;
    if (!orgcd || !whcd || !Array.isArray(rows) || rows.length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: 'orgcd/whcd/rows(배열)가 필요합니다.' }));
      return;
    }
    const session = await loginWmsSession();
    const resultList = await session.setCheck('P200200', orgcd, whcd, rows);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, resultList }));
    console.log(`[${new Date().toISOString()}] /order-verify/wms-check 응답 완료 (${rows.length}건)`);
  } catch (e) {
    console.error('에러:', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: e.message }));
  }
}

async function handleOrderVerifyWmsUpload(req, res) {
  try {
    const bodyText = await readBody(req);
    let body;
    try { body = JSON.parse(bodyText); } catch { body = null; }
    const orgcd = body && body.orgcd;
    const whcd = body && body.whcd;
    const rows = body && body.rows;
    if (!orgcd || !whcd || !Array.isArray(rows) || rows.length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: 'orgcd/whcd/rows(배열)가 필요합니다.' }));
      return;
    }
    const session = await loginWmsSession();
    const checked = await session.setCheck('P200200', orgcd, whcd, rows);
    await session.uploadRows('P200200', orgcd, whcd, checked);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, count: checked.length }));
    console.log(`[${new Date().toISOString()}] /order-verify/wms-upload 응답 완료 (${checked.length}건)`);
  } catch (e) {
    console.error('에러:', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: e.message }));
  }
}

const server = http.createServer((req, res) => {
  withCors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method === 'GET' && req.url === '/stock.xlsx') { handleStock(res); return; }
  if (req.method === 'POST' && req.url === '/ipgo/verify') { handleIpgoVerify(req, res); return; }
  if (req.method === 'POST' && req.url === '/order-verify/save') { handleOrderVerifySave(req, res); return; }
  if (req.method === 'POST' && req.url === '/order-verify/wms-check') { handleOrderVerifyWmsCheck(req, res); return; }
  if (req.method === 'POST' && req.url === '/order-verify/wms-upload') { handleOrderVerifyWmsUpload(req, res); return; }
  if (req.method === 'GET' && req.url.startsWith('/kurly/orders')) {
    handleKurlyOrders(new URL(req.url, `http://localhost:${PORT}`), res);
    return;
  }
  if (req.method === 'GET' && req.url.startsWith('/kurly/plan-goods-detail')) {
    handlePlanGoodsDetail(new URL(req.url, `http://localhost:${PORT}`), res);
    return;
  }
  if (req.method === 'GET' && req.url.startsWith('/kurly/receiving-times')) {
    handleReceivingTimes(new URL(req.url, `http://localhost:${PORT}`), res);
    return;
  }
  if (req.method === 'GET' && req.url.startsWith('/wms/outbound')) {
    handleWmsOutbound(new URL(req.url, `http://localhost:${PORT}`), res);
    return;
  }
  if (req.method === 'GET' && req.url.startsWith('/kurly/plan-goods-list')) {
    handleKurlyPlanGoodsList(new URL(req.url, `http://localhost:${PORT}`), res);
    return;
  }
  if (req.method === 'POST' && req.url === '/kurly/plan-goods-patch') {
    handlePlanGoodsPatch(req, res);
    return;
  }
  if (req.method === 'GET' && req.url === '/kurly/launch-debug-chrome') {
    launchKurlyDebugChrome()
      .then((r) => {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(r));
      })
      .catch((e) => {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: e.message }));
      });
    return;
  }
  if (req.method === 'GET' && req.url === '/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`재고현황 로컬 서버 실행 중: http://localhost:${PORT}`);
  console.log('이 창을 닫으면 서버도 꺼집니다. 발주서검증도구_웹.html의 "실시간 재고 다운로드" 버튼을 쓰는 동안엔 켜두세요.');
});
