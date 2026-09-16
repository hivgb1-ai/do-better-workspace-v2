// 컬리 파트너포털: 입고예정일 기준 발주 목록 재조회 + 소비기한 업로드양식(1단계) 일괄 다운로드
const fs = require('fs');
const path = require('path');

const [, , token, dateStr, downloadsDir] = process.argv;
if (!token || !dateStr || !downloadsDir) {
  console.error('사용법: node kurly_list_and_templates.js "<Bearer토큰>" "YYYY-MM-DD" "<다운로드폴더>"');
  process.exit(1);
}

const supplierCode = 'VD3341';

async function fetchList() {
  const params = new URLSearchParams({
    dateType: 'RECEIVING_ESTIMATE',
    dateFrom: `${dateStr}T00:00:00`,
    dateTo: `${dateStr}T23:59:00`,
    supplierCode,
    approvalStatuses: 'ENROLLED,BEFORE_APPROVAL_SUPPLIER,BEFORE_APPROVAL_MD,APPROVED,CANCEL',
    sort: 'PURCHASE_DESC',
    limit: '50',
    currentPage: '1',
    searchField: 'goodsName',
    onlyGoodsCode: 'false',
    supplierSearchField: 'supplierName',
  });
  const res = await fetch(`https://api.escm.kurly.com/api/v2/purchaseorders?${params.toString()}`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`목록조회 실패 HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  return json.result.data;
}

async function downloadTemplate(orderCode) {
  const res = await fetch(
    `https://api-excel.escm.kurly.com/api/v2/purchaseorders/document/download/templates/expiry-manufacture-date/purchase-orders/${orderCode}`,
    { headers: { authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`${orderCode} 템플릿 다운로드 실패 HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const cd = res.headers.get('content-disposition') || '';
  let filename = `발주상품_일자_업로드_양식_${orderCode}.xlsx`;
  const m = cd.match(/filename="?([^";]+)"?/);
  if (m) {
    filename = Buffer.from(m[1], 'latin1').toString('utf8');
  }
  const outPath = path.join(downloadsDir, filename);
  fs.writeFileSync(outPath, buf);
  return outPath;
}

async function main() {
  const orders = await fetchList();
  console.log(`목록 조회: ${orders.length}건`);
  const summary = orders.map((o) => ({
    purchaseOrderId: o.purchaseOrderId,
    purchaseOrderCode: o.purchaseOrderCode,
    approvalStatus: o.approvalStatus,
    itemCount: o.purchaseOrderItemDTOList?.length ?? o.itemCount ?? null,
  }));
  console.table(summary);
  fs.writeFileSync(path.join(downloadsDir, `kurly_orders_${dateStr.replace(/-/g, '')}.json`), JSON.stringify(orders, null, 2), 'utf8');

  for (const o of orders) {
    try {
      const p = await downloadTemplate(o.purchaseOrderCode);
      console.log('저장:', p);
    } catch (e) {
      console.error(o.purchaseOrderCode, '실패:', e.message);
    }
  }
}

main().catch((e) => {
  console.error('실패:', e.message);
  process.exit(1);
});
