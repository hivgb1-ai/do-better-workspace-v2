// 비마트 SCM Mart: 납품수량 일괄입력(입고진행) + 입고확인서(PDF) 다운로드
const fs = require('fs');
const path = require('path');

const [, , cookie, rawJsonPath, outDir] = process.argv;
const content = JSON.parse(fs.readFileSync(rawJsonPath, 'utf8'));

const BASE = 'https://scm-mart-gateway.baemin.com/api/v1';

// 사용자 확정(2026-08-13): 센터명에서 층수 표기 제거 (예: "인천 냉동 4층" -> "인천 냉동")
function normalizeCenterName(name) {
  return (name || '').replace(/\s*\d+층\s*$/, '');
}

async function postReceiving(orderId, items) {
  const body = items.map((it) => ({ orderItemId: it.orderItemId, receivingInfo: { receivingQuantity: it.requestQuantity } }));
  const res = await fetch(`${BASE}/order/${orderId}/status/change/receiving`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie, accept: 'application/json, text/plain, */*', origin: 'https://scm-mart.baemin.com', referer: 'https://scm-mart.baemin.com/' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return { status: res.status, json };
}

async function getPdfDownloadKey(orderId, orderWarehouseId) {
  const res = await fetch(`${BASE}/orders/detail/pdf-download?orderId=${orderId}&orderWarehouseId=${orderWarehouseId}`, {
    headers: { cookie, accept: 'application/json, text/plain, */*', referer: 'https://scm-mart.baemin.com/' },
  });
  if (!res.ok) throw new Error(`pdf-download HTTP ${res.status}`);
  const json = await res.json();
  return json.data;
}

async function downloadPdf(key) {
  const res = await fetch(`${BASE}/file/download-key?downloadKey=${encodeURIComponent(key)}`, {
    headers: { cookie, referer: 'https://scm-mart.baemin.com/' },
  });
  if (!res.ok) throw new Error(`download-key HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const orderIds = [...new Set(content.map((o) => o.orderId))];
  const summary = [];

  for (const orderId of orderIds) {
    const parts = content.filter((o) => o.orderId === orderId);
    const items = parts.flatMap((o) => o.orderItems);
    const orderNo = parts[0].orderNo;
    const supplierVendorName = parts[0].supplierVendorName;
    const orderWarehouseId = items[0].orderWarehouseId;
    const warehousePlaceName = normalizeCenterName(items[0].warehousePlaceName);

    const alreadyDone = items.filter((it) => it.orderStatus === 'RECEIVING' || it.orderStatus === 'CLOSED');
    const toProcess = items.filter((it) => it.orderStatus === 'REQUEST');

    if (toProcess.length === 0) {
      console.log(`[SKIP] ${orderNo} — 처리 대상 없음 (전부 이미 처리됨 또는 다른 상태)`);
      summary.push({ orderId, orderNo, skipped: true });
      continue;
    }

    const { status, json } = await postReceiving(orderId, toProcess);
    const successCount = json?.data?.resultList?.filter((r) => r.success).length ?? 'n/a';
    const failedCount = json?.data?.resultList?.filter((r) => !r.success).length ?? 'n/a';
    console.log(`[RECEIVING] ${orderNo} (${toProcess.length}품목) -> HTTP ${status}, success=${successCount}, failed=${failedCount}`);
    if (failedCount && failedCount !== 'n/a' && failedCount > 0) {
      console.log('  실패 상세:', JSON.stringify(json.data.resultList.filter((r) => !r.success), null, 2));
    }

    const pdfInfo = await getPdfDownloadKey(orderId, orderWarehouseId);
    const pdfBuf = await downloadPdf(pdfInfo.key);
    const fname = `${warehousePlaceName.replace(/\s/g, '')}_입고확인서_${supplierVendorName}_${orderNo}.pdf`;
    const outPath = path.join(outDir, fname);
    fs.writeFileSync(outPath, pdfBuf);
    console.log('  PDF 저장:', outPath, `(${pdfBuf.length} bytes)`);

    summary.push({ orderId, orderNo, itemCount: items.length, processed: toProcess.length, successCount, failedCount, pdfPath: outPath });
  }

  console.log('\n=== 요약 ===');
  console.table(summary);
}

main().catch((e) => {
  console.error('실패:', e.message);
  process.exit(1);
});
