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
// 2026-09-16 (3차): 9/15 실측에서 15건이 전부 "WMS비계획입고"로 오탐되는 버그 발견 — 원인은
// AMBIENT_GID_MAP['2026-09']를 7월 gid(1070227469)로 잘못 넣어둔 것. 실제 9월 상온 수불시트는
// 별도 탭(gid=293073366, 사용자가 URL로 직접 확인해줌)이었다. 이 gid로 9/15 데이터를 직접
// 대조해서 15건 전부 정확히 일치함을 확인 후 수정. 이 참에 VENDOR_COL도 실측 CSV로 검증해서
// "받는창고" 열은 index 8이 아니라 7이고(8은 그 창고의 ERP거래처코드), 텍스트로 바로 매칭됨을
// 확인 — 코드('1000') 우회 매칭 없이 이름 그대로 비교하도록 정리.
//
// [실측 필요 — 아직 확인 안 됨]
//   1) 화주(org) 필터: AI_프롬프트.md가 "이 WMS 계정은 다화주 공유 계정이라 필터링 필수"라고
//      명시하므로 실존하는 필드는 맞다 — 다만 WMS 입고현황 API(getSearch.do TABIDX=2) 응답의
//      정확한 필드명은 이 PC에 저장된 샘플이 없어 확인 못 했다. r._raw에서 ORGNM/ORGNML/ORGNAME
//      순으로 찾아보고, 못 찾으면 필터링 없이 통과시키며 콘솔에 경고를 남긴다 — "타 화주 제외"
//      배지가 항상 0이면 이 경고가 떴는지 서버 콘솔을 확인할 것(0이면 필터가 안 걸리고 있다는 뜻).
//   2) AMBIENT_GID_MAP의 2026-07/08 값: verify.js 주석(2026-07-08 변경 이력)을 그대로 가져온
//      것으로, 9월처럼 매달 새 탭이 파였다면 8월도 실제로는 다른 gid일 수 있다 — 9월만 실측
//      검증됨. 과거 날짜로 검증 시 이상하게 전부 "비계획입고"로 뜨면 이 맵부터 의심할 것.

const { WmsSession } = require('./wms_client.js');
const ExcelJS = require('exceljs');

const SHEET_DOC_ID = '1kM2bt4cvpERfZgmLcs_HCe4usgxQdvcx5o8_cZLV9n0';
const FROZEN_GID = '612298986'; // 냉동 수불 (verify.js 기준, 변경 이력 없음. 연 1개 고정)
// 상온 수불 gid — 월별로 바뀐다(verify.js 주석: 2026-07-08에 1076904455 -> 1070227469 변경 이력).
// 새 달이 되어 시트 담당자가 새 탭을 파면 여기에 한 줄 추가할 것 — 없는 달은 조회 자체를 막는다
// (예전 gid로 조용히 잘못된 달을 조회하는 것보다, 막고 알려주는 쪽이 안전함).
const AMBIENT_GID_MAP = {
  '2026-07': '1070227469', // 미실측 (verify.js 이력 인용)
  '2026-08': '1070227469', // 미실측 (verify.js 이력 인용) — 9월처럼 별도 탭이었을 수 있음
  '2026-09': '293073366',  // 실측 완료 (9/15, 15건 전량 일치 확인)
};
const WARM_QTY_COL = 20, WARM_EXP_COL = 17;
const FROZEN_QTY_COL = 17, FROZEN_EXP_COL = 18;
const VENDOR_COL = 7, TYPE_COL = 1, DATE_COL = 2, ERP_COL = 9, NAME_COL = 10; // VENDOR_COL=7(받는창고 이름). 8은 그 창고의 ERP거래처코드라 다른 값.
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
    const matched = vendorList.includes(vendorCell);
    if (!matched) continue;
    const tp = cols[TYPE_COL]?.trim();
    if (!['매입', '이동'].includes(tp)) continue;
    const rawQty = (cols[qtyCol] || '').trim();
    const qty = rawQty === '' ? null : Math.round(parseFloat(rawQty.replace(/,/g, '')) || 0);
    out.push({
      date: md, erp: (cols[ERP_COL] || '').trim(), name: (cols[NAME_COL] || '').trim(),
      qty, exp: (cols[expCol] || '').trim(), raw: cols,
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

  const workbook = await buildWorkbook(summary, { sublRows, wmsRows });
  const fileName = reportFileName(from, to);

  return { summary, workbook, fileName };
}

// 기존(구글 앱스크립트로 매일 자동 생성되던) 리포트와 같은 명명 규칙:
// 하루면 YYYYMMDD, 기간이면 YYYYMMDD-MMDD (같은 달 기준. 달을 넘기면 뒤쪽도 전체 날짜로 표기).
function reportFileName(from, to) {
  const f = from.replace(/-/g, '');
  if (from === to) return `${f}_이지로지스_입고검증C.xlsx`;
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  const t = sameMonth ? to.slice(5, 7) + to.slice(8, 10) : to.replace(/-/g, '');
  return `${f}-${t}_이지로지스_입고검증C.xlsx`;
}

// AI_프롬프트.md/사용법.md가 가리키는 정본 위치 — 매달 담당자가 만드는 YYYYMM 폴더 아래 저장.
const REPORT_BASE_DIR = 'G:\\공유 드라이브\\HQ_Team_SCM\\4.물류운영팀\\SCM_Logistics_김명은\\0. Claude\\이지로지스_입고검증_자동화';

function reportSavePath(from, fileName) {
  const path = require('path');
  const yyyymm = from.slice(0, 4) + from.slice(5, 7);
  return path.join(REPORT_BASE_DIR, yyyymm, fileName);
}

// 엑셀 리포트 다운로드 버튼용 — 이미 만들어둔 workbook 버퍼를 그 자리에 그대로 저장.
// 같은 날짜로 다시 실행하면 그날 파일을 덮어쓴다(기존 자동화도 동일 관례) — 단, 그 파일이
// 엑셀에서 열려 있으면(잠금) 쓰기가 실패하니 그 경우 에러를 그대로 올려보낸다.
async function saveReportToShareDrive(buffer, from, to) {
  const fs = require('fs');
  const path = require('path');
  const fileName = reportFileName(from, to);
  const fullPath = reportSavePath(from, fileName);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, buffer);
  return fullPath;
}

async function buildWorkbook(summary, raw) {
  const wb = new ExcelJS.Workbook();
  buildSummarySheet(wb, summary);
  buildSublSheet(wb, raw.sublRows, summary);
  buildWmsSheet(wb, raw.wmsRows);
  return wb;
}

const COLOR = {
  navy: 'FF1F4E78', midBlue: 'FFBDD7EE', lightBlue: 'FFDCE6F2',
  gray: 'FFD9D9D9', ok: 'FF1A7F37', bad: 'FFC00000',
};
const NUMFMT = '#,##0';

function fillCell(cell, argb) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } }; }
function signColor(n) { return typeof n === 'number' && n < 0 ? COLOR.bad : (typeof n === 'number' && n > 0 ? COLOR.ok : null); }

function buildSummarySheet(wb, summary) {
  const ws = wb.addWorksheet('요약');
  ws.columns = [
    { width: 34 }, { width: 14 }, { width: 2 }, { width: 2 },
    { width: 10 }, { width: 16 }, { width: 42 }, { width: 12 }, { width: 12 }, { width: 10 }, { width: 22 },
  ];

  // 제목 배너 (전체 폭)
  const titleRow = ws.addRow([`입고내역 검증 요약 — ${summary.range} ${summary.vendor}`]);
  ws.mergeCells(titleRow.number, 1, titleRow.number, 11);
  titleRow.height = 22;
  titleRow.eachCell({ includeEmpty: true }, c => { fillCell(c, COLOR.navy); c.font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } }; c.alignment = { vertical: 'middle', indent: 1 }; });
  ws.addRow([]);

  const sectionHeader = (label, colFrom, colTo) => {
    const row = ws.addRow([]);
    if (colFrom === 1) row.getCell(1).value = label; else row.getCell(colFrom).value = label;
    ws.mergeCells(row.number, colFrom, row.number, colTo);
    for (let c = colFrom; c <= colTo; c++) { fillCell(row.getCell(c), COLOR.midBlue); row.getCell(c).font = { bold: true }; }
    return row.number;
  };
  const numRow = (label, value, opts) => {
    const row = ws.addRow([label, value]);
    fillCell(row.getCell(1), COLOR.lightBlue); fillCell(row.getCell(2), COLOR.lightBlue);
    row.getCell(2).numFmt = NUMFMT;
    row.getCell(2).alignment = { horizontal: 'right' };
    if (opts?.bold) { row.getCell(1).font = { bold: true }; row.getCell(2).font = { bold: true }; }
    if (opts?.colorBySign) { const col = signColor(value); if (col) row.getCell(2).font = { ...(row.getCell(2).font || {}), color: { argb: col } }; }
    return row;
  };

  const headerRow = ws.addRow([]);
  headerRow.getCell(1).value = '총계 대사';
  ws.mergeCells(headerRow.number, 1, headerRow.number, 2);
  headerRow.getCell(5).value = '예외 상세 (직렬 — 한 줄에 한 건)';
  ws.mergeCells(headerRow.number, 5, headerRow.number, 11);
  [1, 2, 5, 6, 7, 8, 9, 10, 11].forEach(c => { fillCell(headerRow.getCell(c), COLOR.midBlue); headerRow.getCell(c).font = { bold: true }; });
  const detailAnchorRow = headerRow.number;
  numRow('재고수불 실입고수량 합계 (수불시트)', summary.scmTotal);
  numRow('WMS 총입고수량 (매출반품 제외)', summary.wmsTotalExRet);
  numRow('차이 (수불시트 − WMS)', summary.diffTotal, { bold: true, colorBySign: true });
  ws.addRow([]);
  sectionHeader('차이 분해 (예외 유형별)', 1, 2);

  const mismatchAmt = summary.details.mismatch.reduce((a, r) => a + r.차이, 0);
  const notReceivedAmt = summary.details.notReceived.reduce((a, r) => a + r.재고수불수량, 0);
  const unplannedAmt = -summary.details.unplanned.reduce((a, r) => a + r.WMS수량, 0);
  const blankScmAmt = -summary.details.blankScm.reduce((a, r) => a + r.WMS수량, 0);
  const countNote = (n) => `${n}건 — 상세는 우측 표 참조`;

  const breakdownRow = (label, amount, count) => {
    const row = numRow(label, amount, { colorBySign: true });
    row.getCell(3).value = countNote(count);
    row.getCell(3).font = { italic: true, color: { argb: 'FF666666' } };
    return row;
  };
  breakdownRow('└ 냉동/상온 수불시트 미기재 (실입고수량 공란)', blankScmAmt, summary.details.blankScm.length);
  breakdownRow('└ WMS 비계획입고 (재고수불 시트 미기재)', unplannedAmt, summary.details.unplanned.length);
  breakdownRow('└ 미입고', notReceivedAmt, summary.details.notReceived.length);
  breakdownRow('└ 수불시트_WMS 수량불일치', mismatchAmt, summary.details.mismatch.length);
  const pendingRow = numRow('미확정 (대기중, 실입고 0건 — 총계엔 영향 없음, 참고용)', summary.details.pending.length);
  pendingRow.getCell(3).value = countNote(summary.details.pending.length);
  pendingRow.getCell(3).font = { italic: true, color: { argb: 'FF666666' } };
  numRow('매출반품 (제외 대상, 참고)', summary.retTotal);
  ws.addRow([]);
  sectionHeader('검증 결과', 1, 2);
  numRow('잔여 미설명 차이 (0이어야 정상)', summary.residual, { bold: true, colorBySign: true });
  const abnormalCount = summary.details.mismatch.length + summary.details.notReceived.length +
    summary.details.unplanned.length + summary.details.blankScm.length;
  numRow('불일치 건수 (품목코드+날짜 기준)', abnormalCount);
  numRow('완전일치 그룹 수', summary.counts.complete);
  numRow('전체 대사 그룹 수 (품목코드+날짜)', summary.counts.totalGroups);

  // 예외 상세 — 유형별로 따로 표를 이어붙임 (컬럼 E부터), 건이 없는 유형은 표 자체를 생략.
  let r = detailAnchorRow; // '총계 대사'/'예외 상세' 헤더가 있던 행 다음부터
  const DETAIL_COLS = ['날짜', '품목코드', '상품명', 'WMS수량', '수불시트수량', '차이', '비고'];
  const writeDetailTable = (label, rows, mapRow) => {
    if (!rows.length) return;
    r++;
    const hRow = ws.getRow(r);
    hRow.getCell(5).value = label;
    ws.mergeCells(r, 5, r, 11);
    hRow.getCell(5).font = { bold: true, color: { argb: COLOR.bad } };
    r++;
    const colRow = ws.getRow(r);
    DETAIL_COLS.forEach((c, i) => { colRow.getCell(5 + i).value = c; fillCell(colRow.getCell(5 + i), COLOR.gray); colRow.getCell(5 + i).font = { bold: true }; });
    rows.forEach(d => {
      r++;
      const vals = mapRow(d);
      DETAIL_COLS.forEach((c, i) => {
        const cell = ws.getRow(r).getCell(5 + i);
        cell.value = vals[i] ?? '';
        if (typeof vals[i] === 'number') { cell.numFmt = NUMFMT; cell.alignment = { horizontal: 'right' }; }
      });
      const diffCell = ws.getRow(r).getCell(10);
      const col = signColor(vals[5]);
      if (col) diffCell.font = { color: { argb: col }, bold: true };
    });
    r++; // 표 사이 빈 줄
  };

  writeDetailTable('① 수불시트_WMS 수량불일치', summary.details.mismatch,
    d => [d.날짜, d.품목코드, d.상품명, d.WMS수량, d.재고수불수량, d.차이, '']);
  writeDetailTable('② 미입고', summary.details.notReceived,
    d => [d.날짜, d.품목코드, d.상품명, 0, d.재고수불수량, d.재고수불수량, '']);
  writeDetailTable('③ WMS 비계획입고 (재고수불 시트 미기재)', summary.details.unplanned,
    d => [d.날짜, d.품목코드, d.상품명, d.WMS수량, 0, -d.WMS수량, d.거래처명]);
  writeDetailTable('④ 냉동/상온 수불시트 미기재 (실입고수량 공란)', summary.details.blankScm,
    d => [d.날짜, d.품목코드, d.상품명, d.WMS수량, 0, -d.WMS수량, '수불시트 미기재']);
}

function buildSublSheet(wb, sublRows, summary) {
  const ws = wb.addWorksheet('재고수불시트');
  const header = [
    '작성자', '수불유형', '입고날짜', '요일', '보내는창고', 'WMS\n거래처코드\n(보내는 창고)',
    'ERP\n창고코드\n(보내는 창고)', '받는창고', 'ERP\n거래처코드\n(받는 창고)', 'ERP 코드', '상품명',
    '상/저온', '입수량', '단위', '요청\n수량', 'BOX\n수량', 'PLT\n요청수량', '소비기한', '참고사항',
    'PLT입수량', '실입고 수량', '배차요청\n', 'ERP 매입', '입고예정\n등록', '입고확인\nSNOP',
    '출고확인\nLogistics', '입고확인\nLogistics', 'ERP처리', '바코드(한성 한정)',
  ];
  ws.addRow(header).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  // CSV export는 "4,320"처럼 천단위 콤마가 든 숫자를 문자열 그대로 내려준다 — 엑셀에서
  // 진짜 숫자로 다뤄지도록 콤마 있는 순수 숫자 형태만 골라 변환.
  const toNum = (v) => (/^-?[\d,]+(\.\d+)?$/.test(v) ? Number(v.replace(/,/g, '')) : v);
  sublRows.forEach(r => ws.addRow(r.raw.map(toNum)));
  ws.getColumn(11).width = 40;
  ws.getColumn(21).numFmt = NUMFMT;

  // 오른쪽 피벗: 품목코드별 수불시트 행수 + (참고용) 수불시트 실입고 합계
  const pivotCol = header.length + 2; // 빈 열 하나 띄우고
  const wsRow1 = ws.getRow(1);
  wsRow1.getCell(pivotCol).value = '품목코드';
  wsRow1.getCell(pivotCol + 1).value = '품목명';
  wsRow1.getCell(pivotCol + 2).value = '합계 : 실입고수량(수불시트)';
  wsRow1.getCell(pivotCol + 3).value = '수불행수(COUNTIF)';
  const byErp = new Map();
  sublRows.forEach(r => {
    const g = byErp.get(r.erp) || { name: r.name, qty: 0, count: 0 };
    if (r.qty) g.qty += r.qty;
    g.count++;
    if (r.name) g.name = r.name;
    byErp.set(r.erp, g);
  });
  let pr = 1;
  byErp.forEach((g, erp) => {
    pr++;
    ws.getRow(pr).getCell(pivotCol).value = erp;
    ws.getRow(pr).getCell(pivotCol + 1).value = g.name;
    ws.getRow(pr).getCell(pivotCol + 2).value = g.qty;
    ws.getRow(pr).getCell(pivotCol + 3).value = g.count;
  });
  ws.views = [{ state: 'frozen', ySplit: 1 }];
}

function buildWmsSheet(wb, wmsRows) {
  const ws = wb.addWorksheet('WMS 입고현황');
  const header = [
    '입고번호', '입고요청일자', '입고일자', '입고상태', '입고유형', '창고코드', '창고명', '거래처코드',
    '거래처명', '품목코드', '품목명', '단위', 'PLT입수량', 'BOX입수량', '입고수량', '입고PLT', '입고BOX',
    '입고EA', '소비기한', 'LOT', '입고일자로트', '단가', '품목대분류', '품목중분류', '비고', '요청수량',
  ];
  ws.addRow(header).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  wmsRows.forEach(r => ws.addRow([
    r.입고번호, r.입고요청일자, r.입고일자, r.입고상태, r.입고유형, r.창고코드, r.창고명, r.거래처코드,
    r.거래처명, r.품목코드, r.품목명, r.단위, r.PLT입수량, r.BOX입수량, r.입고수량, r.입고PLT, r.입고BOX,
    r.입고EA, r.소비기한, r.LOT, r.입고일자로트, r.단가, r.품목대분류, r.품목중분류, r.비고, r.입고수량,
  ]));
  ws.getColumn(11).width = 40;
  ws.getColumn(15).numFmt = NUMFMT;
  ws.getColumn(26).numFmt = NUMFMT;
  ws.views = [{ state: 'frozen', ySplit: 1 }];
}

module.exports = { runVerification, saveReportToShareDrive, reportFileName, reportSavePath, AMBIENT_GID_MAP, FROZEN_GID, SHEET_DOC_ID };
