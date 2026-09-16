// WMS 재고현황(화주x창고x로케이션별) API 응답 -> 발주서검증도구_웹.html이 읽는 xlsx 컬럼 배치.
// fetch_stock.js(파일 저장)와 server.js(실시간 버튼)가 동일 로직을 공유한다 — 따로 두면
// 한쪽만 고치고 잊어버리는 사고가 나기 쉽다(실제로 컬럼 인덱스 버그를 한 번 겪음).
const ExcelJS = require('exceljs');

// 발주서검증도구_웹.html의 core.js는 `col(row, n) { return row[n - 1]; }` — 즉 HEADER_SANITY/
// buildStockIndex가 참조하는 숫자는 0-based 배열 인덱스가 아니라 "엑셀 컬럼번호(1-based)"다.
// 절대 위치가 바뀌면 안 되는 곳(1-based 컬럼번호 기준, 괄호 안은 0-based 배열 인덱스):
//   2번째 컬럼(idx1)=화주명, 6번째(idx5)=할당금지여부, 7번째(idx6)=품목코드,
//   11번째(idx10)=BOX입수량, 12번째(idx11)=가용수량, 26번째(idx25)=소비기한, 29번째(idx28)=로트키
const COLUMNS = [
  { header: '화주코드', field: 'ORGCD' },
  { header: '화주명', field: 'ORGNM' },                   // 1-based 2번째
  { header: '창고코드', field: 'WHCD' },
  { header: '창고명', field: 'WHNM' },
  { header: '로케이션', field: 'LOCCD' },
  { header: '할당금지여부', field: 'NOTALLOCFLG_LABEL' },   // 1-based 6번째
  { header: '품목코드', field: 'ITEMCD' },                  // 1-based 7번째
  { header: '품목명', field: 'ITEMNM' },
  { header: '세트여부', field: 'SETYN' },
  { header: '카톤입수량', field: 'INCTNQTY' },
  { header: 'BOX입수량', field: 'INBOXQTY' },               // 1-based 11번째
  { header: '가용수량', field: 'AVAILABLEQTY' },            // 1-based 12번째
  { header: '가용[카톤]', field: 'AVAILABLEQTYCTN' },
  { header: '가용[BOX]', field: 'AVAILABLEQTYBOX' },
  { header: '가용[EA]', field: 'AVAILABLEQTYEA' },
  { header: '재고수량', field: 'QTY' },
  { header: '재고[카톤]', field: 'QTYCTN' },
  { header: '재고[BOX]', field: 'QTYBOX' },
  { header: '재고[EA]', field: 'QTYEA' },
  { header: '할당수량', field: 'ALLOCQTY' },
  { header: '할당[카톤]', field: 'ALLOCQTYCTN' },
  { header: '할당[BOX]', field: 'ALLOCQTYBOX' },
  { header: '할당[EA]', field: 'ALLOCQTYEA' },
  { header: '품목속성', field: 'LOTDAMAGE_LABEL' },
  { header: '품목사이즈', field: 'ITEMSIZE' },
  { header: '소비기한', field: 'LOT1_DATE' },               // 1-based 26번째
  { header: '입고일자(로트)', field: 'LOTWIDT_DATE' },
  { header: '대분류', field: 'ITEMCAT1NM' },
  { header: '로트키', field: 'LOTKEY' },                    // 1-based 29번째
  { header: '유통기간일수', field: 'LIMITDAY' },
  { header: '소비기한임박률(%)', field: 'PERCENT' },
  { header: '중분류', field: 'ITEMCAT2NM' },
  { header: '소분류', field: 'ITEMCAT3NM' },
  { header: '보관온도', field: 'KEEPTEMP_LABEL' },
  { header: '관리단위', field: 'UNITTYPE' },
  { header: '물류바코드', field: 'BARCODE' },
  { header: 'BOX바코드', field: 'BOXBARCODE' },
  { header: '카톤바코드', field: 'CTNBARCODE' },
  { header: '회사명', field: 'COMPNM' }, // 39번째(맨 끝) — 발주서검증도구_웹.html의 NUM_STOCK_COLS(39)에 맞춤, 검증 로직은 안 읽음
];

const NOTALLOCFLG_LABEL = { N: '할당가능', Y: '할당불가' };
const LOTDAMAGE_LABEL = { '0': '정상품', '1': '불량품', '2': '검사품' };
const KEEPTEMP_LABEL = { '10': '상온', '20': '냉장', '30': '냉동' };

function toIsoDate(ymd) {
  if (!ymd) return '';
  const s = String(ymd);
  return s.length === 8 ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : s;
}

function toRowValues(r) {
  const enriched = Object.assign({}, r, {
    NOTALLOCFLG_LABEL: NOTALLOCFLG_LABEL[r.NOTALLOCFLG] || r.NOTALLOCFLG || '',
    LOTDAMAGE_LABEL: LOTDAMAGE_LABEL[r.LOTDAMAGE] || r.LOTDAMAGE || '',
    KEEPTEMP_LABEL: KEEPTEMP_LABEL[r.KEEPTEMP] || r.KEEPTEMP || '',
    LOT1_DATE: toIsoDate(r.LOT1),
    LOTWIDT_DATE: toIsoDate(r.LOTWIDT),
  });
  return COLUMNS.map(c => {
    const v = enriched[c.field];
    return v === null || v === undefined ? '' : v;
  });
}

async function buildWorkbook(rows) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  ws.addRow(COLUMNS.map(c => c.header));
  rows.forEach(r => ws.addRow(toRowValues(r)));
  return wb;
}

module.exports = { COLUMNS, toRowValues, buildWorkbook };
