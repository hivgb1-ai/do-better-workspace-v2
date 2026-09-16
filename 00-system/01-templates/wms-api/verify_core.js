// 이지로지스_입고검증_웹.html의 "검증 실행" 버튼이 쓰는 핵심 로직.
// server.js가 require('./verify_core.js')로 불러와 runVerification()을 호출한다.
//
// 2026-09-16: 이 파일 자체가 폴더에 없어서 /ipgo/verify 라우트가 죽어있던 것을 새로 작성함.
// verify.js(구버전 CLI 도구, "품목별 입고 리스트" xlsx 수동 다운로드 + erp×소비기한 피벗 리포트 전용)의
// 구글시트 CSV 파싱 방식을 재사용하되, 이 웹도구가 기대하는 요약(summary) 구조 —
// 완전일치 / 수불시트_WMS수량불일치 / 미입고 / WMS비계획입고 / 수불시트미기재(공란) / 미확정 —
// 로 새로 분류했고, WMS 조회도 파일 업로드 대신 wms_client.js로 직접 로그인+조회한다.
//
// 2026-09-16 (2차): 00-system/01-templates/wms-api/AI_프롬프트.md·사용법.md가 이 파일을 가리키며
// 기대하는 계약(runVerification 외 AMBIENT_GID_MAP/FROZEN_GID/SHEET_DOC_ID export, 화주 필터
// 필수, 품목코드+날짜 그룹대사, 판정 6종)에 맞춰 이름/구조를 정리함. 이 폴더 자체가 그 워크스페이스
// 템플릿 경로의 실제 배포 사본(각자 PC에 복사해 쓰는 원본)이라, 로직을 고칠 땐 여기와 템플릿
// 양쪽에 같이 반영해야 한다.
//
// [실측 필요 — 아직 라이브로 검증 안 됨, 처음 실행 결과를 보고 맞는지 확인할 것]
//   1) 화주(org) 필터: AI_프롬프트.md가 "이 WMS 계정은 다화주 공유 계정이라 필터링 필수"라고
//      명시하므로 실존하는 필드는 맞다 — 다만 WMS 입고현황 API(getSearch.do TABIDX=2) 응답의
//      정확한 필드명은 이 PC에 저장된 샘플이 없어 확인 못 했다. r._raw에서 ORGNM/ORGNML/ORGNAME
//      순으로 찾아보고, 못 찾으면 필터링 없이 통과시키며 콘솔에 경고를 남긴다 — "타 화주 제외"
//      배지가 항상 0이면 이 경고가 떴는지 서버 콘솔을 확인할 것(0이면 필터가 안 걸리고 있다는 뜻).
//   2) 거래처(vendor) 매칭: 수불시트의 "받는창고" 열(구버전 코드 기준 9번째 열, index 8)이
//      실제로 창고 이름 텍스트인지 코드인지 verify.js 기준으로도 불명확했다(구버전은 '1000'
//      코드를 "이지로지스"로 하드코딩). 이름 텍스트 매칭을 기본으로 하되 알려진 코드('1000')도
//      같이 허용한다. 기본값의 두 번째 거래처("이지로지스 불용창고")는 알려진 코드가 없어
//      텍스트 매칭만 되므로, 첫 실행에서 "수불시트 0건"이 뜨면 이 열의 실제 표기를 확인해야 한다.

const { WmsSession } = require('./wms_client.js');
const ExcelJS = require('exceljs');

const SHEET_DOC_ID = '1kM2bt4cvpERfZgmLcs_HCe4usgxQdvcx5o8_cZLV9n0';
const FROZEN_GID = '612298986'; // 냉동 수불 (verify.js 기준, 변경 이력 없음. 연 1개 고정)
// 상온 수불 gid — 월별로 바뀐다(verify.js 주석: 2026-07-08에 1076904455 -> 1070227469 변경 이력).
// 새 달이 되어 시트 담당자가 새 탭을 파면 여기에 한 줄 추가할 것 — 없는 달은 조회 자체를 막는다
// (예전 gid로 조용히 잘못된 달을 조회하는 것보다, 막고 알려주는 쪽이 안전함).
const AMBIENT_GID_MAP = {
  '2026-07': '1070227469',
  '2026-08': '1070227469',
  '2026-09': '1070227469',
};
const WARM_QTY_COL = 20, WARM_EXP_COL = 17;
const FROZEN_QTY_COL = 17, FROZEN_EXP_COL = 18;
const VENDOR_COL = 8, TYPE_COL = 1, DATE_COL = 2, ERP_COL = 9, NAME_COL = 10;
const VENDOR_CODE_MAP = { '이지로지스': '1000' };
const DEFAULT_VENDORS = ['이지로지스', '이지로지스 불용창고'];

function ambientGidFor(isoDate) {
  const key = isoDate.slice(0, 7);
  const gid = AMBIENT_GID_MAP[key];
  if (!gid) throw new Error(`AMBIENT_GID_MAP에 ${key} 항목이 없습니다 — 상온 탭 gid를 확인해서 verify_core.js에 한 줄 추가하세요.`);
  return gid;
}

function exportUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_DOC_ID}/export?format=csv&gid=${gid}`;
}
async function fetchCsv(gid) {
  const res = await fetch(exportUrl(gid), { redirect: 'follow' });
  if (!res.ok) throw new Error(`수불시트(gid=${gid}) 다운로드 실패: HTTP ${res.status}`);
  let txt = await res.text();
  if (txt.charCodeAt(0) === 0xFEFF) txt = txt.slice(1);
  if (txt.trim().startsWith('<')) throw new Error(`수불시트(gid=${gid})가 CSV가 아닌 HTML(로그인 페이지)을 반환했습니다. 시트 공유 설정을 확인하세요.`);
  return txt;
}
function splitCsvLine(line) {
  const clean = line.replace(/"([^"]*)"/g, (m, g) => g.replace(/,/g, '§'));
  return clean.split(',').map(c => c.replace(/§/g, ','));
}

function dateRangeMD(from, to) {
  const out = [];
  const d = new Date(from + 'T00:00:00');
  const end = new Date(to + 'T00:00:00');
  while (d <= end) {
    out.push(`${d.getMonth() + 1}/${d.getDate()}`);
    d.setDate(d.getDate() + 1);
  }
  return out;
}
function mdToIso(md, yearHint) {
  const [m, d] = md.split('/').map(Number);
  return `${yearHint}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// 대상 기간 + 거래처(vendor) 매칭 행을 blank(실입고수량 미기재) 포함 모두 반환.
function parseSubl(csv, qtyCol, expCol, targetMDs, vendorList) {
  const lines = csv.split('\n');
  const out = [];
  for (const l of lines) {
    if (!l.trim()) continue;
    const cols = splitCsvLine(l);
    const md = cols[DATE_COL]?.trim();
    if (!targetMDs.includes(md)) continue;
    const vendorCell = cols[VENDOR_COL]?.trim();
    const matched = vendorList.some(v => vendorCell === v || vendorCell === VENDOR_CODE_MAP[v]);
    if (!matched) continue;
    const tp = cols[TYPE_COL]?.trim();
    if (!['매입', '이동'].includes(tp)) continue;
    const rawQty = (cols[qtyCol] || '').trim();
    const qty = rawQty === '' ? null : Math.round(parseFloat(rawQty.replace(/,/g, '')) || 0);
    out.push({
      date: md, erp: (cols[ERP_COL] || '').trim(), name: (cols[NAME_COL] || '').trim(),
      qty, exp: (cols[expCol] || '').trim(),
    });
  }
  return out;
}

function extractOrgName(raw) {
  return raw.ORGNM ?? raw.ORGNML ?? raw.ORGNAME ?? null;
}

async function runVerification({ username, password, from, to, vendor, org, ambientGidOverride }) {
  const vendorList = (vendor && vendor.trim())
    ? vendor.split(',').map(s => s.trim()).filter(Boolean)
    : DEFAULT_VENDORS;
  const orgFilter = (org && org.trim()) ? org.trim() : '이그니스';

  const session = new WmsSession();
  await session.login(username, password);
  const wmsRowsAll = await session.fetchInboundByReceivedDate(from, to);

  let excludedByOrg = 0;
  let orgFieldFound = false;
  const wmsRows = wmsRowsAll.filter(r => {
    const orgName = extractOrgName(r._raw || {});
    if (orgName == null) return true;
    orgFieldFound = true;
    const ok = orgName === orgFilter;
    if (!ok) excludedByOrg++;
    return ok;
  });
  if (wmsRowsAll.length && !orgFieldFound) {
    console.warn('[verify_core] WMS 입고현황 응답에서 화주(ORGNM 계열) 필드를 찾지 못해 화주 필터를 적용하지 못했습니다. 실제 필드명을 확인해서 extractOrgName()을 고쳐야 합니다.');
  }

  const pendingRows = wmsRows.filter(r => r.입고상태 !== '취소' && r.입고상태 !== '입고완료');
  const completedRows = wmsRows.filter(r => r.입고상태 === '입고완료');
  const retRows = completedRows.filter(r => r.입고유형 === '매출반품');
  const actualRows = completedRows.filter(r => r.입고유형 !== '매출반품');

  const targetMDs = dateRangeMD(from, to);
  const yearHint = from.slice(0, 4);
  const warmGid = (ambientGidOverride && ambientGidOverride.trim()) || ambientGidFor(from);

  const [warmCsv, frozenCsv] = await Promise.all([fetchCsv(warmGid), fetchCsv(FROZEN_GID)]);
  const sublRows = [
    ...parseSubl(warmCsv, WARM_QTY_COL, WARM_EXP_COL, targetMDs, vendorList),
    ...parseSubl(frozenCsv, FROZEN_QTY_COL, FROZEN_EXP_COL, targetMDs, vendorList),
  ];

  const scmByKey = new Map();
  for (const r of sublRows) {
    const iso = mdToIso(r.date, yearHint);
    const key = iso + '||' + r.erp;
    const g = scmByKey.get(key) || { date: iso, erp: r.erp, name: r.name, qty: 0, hasQty: false, hasBlank: false };
    if (r.qty === null) g.hasBlank = true; else { g.qty += r.qty; g.hasQty = true; }
    if (r.name) g.name = r.name;
    scmByKey.set(key, g);
  }

  const wmsByKey = new Map();
  for (const r of actualRows) {
    const key = r.입고일자 + '||' + r.품목코드;
    const g = wmsByKey.get(key) || { date: r.입고일자, erp: r.품목코드, name: r.품목명, qty: 0, vendor: r.거래처명 };
    g.qty += Number(r.입고수량) || 0; // 문자열로 와도 숫자 비교가 깨지지 않도록 명시 변환
    if (r.품목명) g.name = r.품목명;
    if (r.거래처명) g.vendor = r.거래처명;
    wmsByKey.set(key, g);
  }

  const allKeys = new Set([...scmByKey.keys(), ...wmsByKey.keys()]);
  const mismatch = [], notReceived = [], unplanned = [], blankScm = [];
  let complete = 0;

  for (const key of allKeys) {
    const s = scmByKey.get(key);
    const w = wmsByKey.get(key);
    const wq = w ? w.qty : 0;
    const date = s?.date || w?.date;
    const erp = s?.erp || w?.erp;
    const name = s?.name || w?.name || '';

    if (s && s.hasQty) {
      if (wq === 0) { notReceived.push({ 날짜: date, 품목코드: erp, 상품명: name, 재고수불수량: s.qty }); continue; }
      if (s.qty === wq) { complete++; continue; }
      mismatch.push({ 날짜: date, 품목코드: erp, 상품명: name, WMS수량: wq, 재고수불수량: s.qty, 차이: s.qty - wq });
      continue;
    }
    if (s && s.hasBlank) {
      if (wq > 0) blankScm.push({ 날짜: date, 품목코드: erp, 상품명: name, WMS수량: wq });
      continue;
    }
    if (!s && wq > 0) {
      unplanned.push({ 날짜: date, 품목코드: erp, 상품명: name, WMS수량: wq, 거래처명: w?.vendor || '' });
    }
  }

  const pending = pendingRows.map(r => ({
    날짜: r.입고일자 || r.입고요청일자, 품목코드: r.품목코드, 상품명: r.품목명,
    거래처명: r.거래처명, 입고상태: r.입고상태, 요청수량: r.입고수량,
  }));

  const scmTotal = [...scmByKey.values()].filter(g => g.hasQty).reduce((a, g) => a + g.qty, 0);
  const wmsTotalExRet = actualRows.reduce((a, r) => a + (Number(r.입고수량) || 0), 0);
  const retTotal = retRows.reduce((a, r) => a + (Number(r.입고수량) || 0), 0);
  const diffTotal = scmTotal - wmsTotalExRet;
  const explainedDiff =
    mismatch.reduce((a, r) => a + r.차이, 0) +
    notReceived.reduce((a, r) => a + r.재고수불수량, 0) -
    unplanned.reduce((a, r) => a + r.WMS수량, 0) -
    blankScm.reduce((a, r) => a + r.WMS수량, 0);
  const residual = diffTotal - explainedDiff;

  const totalGroups = complete + mismatch.length + notReceived.length + unplanned.length + blankScm.length;
  const range = from === to ? from : `${from} ~ ${to}`;

  const summary = {
    range, vendor: vendorList.join(','), org: orgFilter,
    wmsRowsCount: wmsRowsAll.length, excludedByOrg, scmRowsCount: sublRows.length,
    scmTotal, wmsTotalExRet, diffTotal, residual, retTotal,
    counts: { complete, totalGroups },
    details: { mismatch, notReceived, unplanned, blankScm, pending },
  };

  const workbook = await buildWorkbook(summary);
  const dateTag = from === to ? from.replace(/-/g, '') : `${from.replace(/-/g, '')}-${to.replace(/-/g, '')}`;
  const fileName = `입고검증_${dateTag}.xlsx`;

  return { summary, workbook, fileName };
}

async function buildWorkbook(summary) {
  const wb = new ExcelJS.Workbook();

  const wsSummary = wb.addWorksheet('요약');
  wsSummary.columns = [{ width: 28 }, { width: 20 }];
  wsSummary.addRows([
    ['기간', summary.range], ['거래처', summary.vendor], ['화주', summary.org],
    ['WMS 건수', summary.wmsRowsCount], ['타 화주 제외', summary.excludedByOrg],
    ['수불시트 건수', summary.scmRowsCount],
    ['수불시트 실입고 합계', summary.scmTotal], ['WMS 총입고(매출반품 제외)', summary.wmsTotalExRet],
    ['차이(수불시트-WMS)', summary.diffTotal], ['잔여 미설명 차이', summary.residual],
    ['매출반품(참고)', summary.retTotal],
    ['완전일치 그룹', summary.counts.complete], ['전체 그룹', summary.counts.totalGroups],
  ]);
  wsSummary.getColumn(1).font = { bold: true };

  const addSheet = (title, rows, cols) => {
    const ws = wb.addWorksheet(title);
    ws.columns = cols.map(c => ({ header: c.label, key: c.key, width: 18 }));
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
    rows.forEach(r => ws.addRow(r));
    ws.views = [{ state: 'frozen', ySplit: 1 }];
  };

  addSheet('①수량불일치', summary.details.mismatch, [
    { key: '날짜', label: '날짜' }, { key: '품목코드', label: '품목코드' }, { key: '상품명', label: '상품명' },
    { key: 'WMS수량', label: 'WMS수량' }, { key: '재고수불수량', label: '수불시트수량' }, { key: '차이', label: '차이' },
  ]);
  addSheet('②미입고', summary.details.notReceived, [
    { key: '날짜', label: '날짜' }, { key: '품목코드', label: '품목코드' }, { key: '상품명', label: '상품명' },
    { key: '재고수불수량', label: '수불시트수량' },
  ]);
  addSheet('③비계획입고', summary.details.unplanned, [
    { key: '날짜', label: '날짜' }, { key: '품목코드', label: '품목코드' }, { key: '상품명', label: '상품명' },
    { key: 'WMS수량', label: 'WMS수량' }, { key: '거래처명', label: '거래처명' },
  ]);
  addSheet('④수불시트미기재', summary.details.blankScm, [
    { key: '날짜', label: '날짜' }, { key: '품목코드', label: '품목코드' }, { key: '상품명', label: '상품명' },
    { key: 'WMS수량', label: 'WMS수량' },
  ]);
  addSheet('⑤미확정', summary.details.pending, [
    { key: '날짜', label: '날짜' }, { key: '품목코드', label: '품목코드' }, { key: '상품명', label: '상품명' },
    { key: '거래처명', label: '거래처명' }, { key: '입고상태', label: '입고상태' }, { key: '요청수량', label: '요청수량' },
  ]);

  return wb;
}

module.exports = { runVerification, AMBIENT_GID_MAP, FROZEN_GID, SHEET_DOC_ID };
