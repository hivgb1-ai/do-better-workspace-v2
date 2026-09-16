// 컬리 파트너포털 0단계: 발주관리 V2 > 발주 내역(입고일) 화면의 "발주 내역 다운로드" 버튼과 동일한 API
// (2026-08-18 포털 UI 개편(V2)으로 엔드포인트가 api-purchase/v2/purchase-order-plan-goods로 교체됨 — 구버전 api-excel.escm.kurly.com/.../supplier/excel/download는 0건만 반환하므로 사용 금지)
// 사용법: node kurly_order_excel_download.js "<Bearer토큰>" "YYYY-MM-DD" "<저장경로.xlsx>" [YYYY-MM-DD(dateTo, 생략시 dateFrom과 동일)]
const fs = require('fs');
const path = require('path');

const [, , token, dateFrom, outPath, dateToArg] = process.argv;
if (!token || !dateFrom || !outPath) {
  console.error('사용법: node kurly_order_excel_download.js "<Bearer토큰>" "YYYY-MM-DD" "<저장경로.xlsx>" [dateTo]');
  process.exit(1);
}
const dateTo = dateToArg || dateFrom;

async function main() {
  const params = new URLSearchParams({
    scheduledReceivingDateFrom: dateFrom,
    scheduledReceivingDateTo: dateTo,
    sortType: 'SCHEDULED_RECEIVING_DATE_ASC',
    limit: '50',
    currentPage: '1',
  });
  const url = `https://api.escm.kurly.com/api-purchase/v2/purchase-order-plan-goods/download/excel?${params.toString()}`;
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}`, accept: '*/*' } });
  if (!res.ok) {
    throw new Error(`다운로드 실패 HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf);
  console.log(`저장 완료: ${outPath} (${buf.length.toLocaleString()} bytes)`);
}

main().catch((e) => {
  console.error('실패:', e.message);
  process.exit(1);
});
