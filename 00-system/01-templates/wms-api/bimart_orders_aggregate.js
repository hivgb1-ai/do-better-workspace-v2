// 비마트 SCM Mart 파트너포털 발주서 취합 (사용자 기존 양식 재현)
// 사용법: node bimart_orders_aggregate.js "<쿠키문자열>" "YYYY-MM-DD(입고예정일)" "<저장폴더 절대경로>" "<날짜라벨(파일명용, 예: 20260818)>"
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const [, , cookie, dateStr, outDir, dateLabelArg] = process.argv;
if (!cookie || !dateStr || !outDir) {
  console.error('사용법: node bimart_orders_aggregate.js "<쿠키문자열>" "YYYY-MM-DD" "<저장폴더>" [날짜라벨]');
  process.exit(1);
}
const dateLabel = dateLabelArg || dateStr.replace(/-/g, '');

// 사용자 확정(2026-08-13): 센터명에서 층수 표기 제거 (예: "인천 냉동 4층" -> "인천 냉동")
function normalizeCenterName(name) {
  return (name || '').replace(/\s*\d+층\s*$/, '');
}

const BASE = 'https://scm-mart-gateway.baemin.com/api/v1/orders/items/search';
const PAGE_SIZE = 200;

async function fetchPage(page) {
  const params = new URLSearchParams({
    orderEventType: 'ORDER',
    startSearchDate: `${dateStr} 00:00:00`,
    finishSearchDate: `${dateStr} 23:59:59`,
    orderRoleType: 'SUPPLIER',
    searchDateType: 'REQUEST_RECEIVING_DATE',
    orderTypes: 'PURCHASE_ORDER',
    orderSortType: 'REQUEST_RECEIVING_DATE_IMMINENT_DESC',
    page: String(page),
    pageSize: String(PAGE_SIZE),
    closedDateChangedData: 'false',
  });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: {
      accept: 'application/json, text/plain, */*',
      cookie,
      referer: 'https://scm-mart.baemin.com/',
      origin: 'https://scm-mart.baemin.com',
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${body.slice(0, 500)}`);
  }
  return res.json();
}

async function main() {
  let page = 0;
  let totalPages = 1;
  const content = [];
  while (page < totalPages) {
    const json = await fetchPage(page);
    if (!json || !json.data) throw new Error('예상치 못한 응답 구조: ' + JSON.stringify(json).slice(0, 300));
    const { data } = json;
    content.push(...(data.content || []));
    totalPages = data.totalPages || 1;
    page += 1;
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'orders_raw.json'), JSON.stringify(content, null, 2), 'utf8');

  // orderId로 그룹핑 (같은 orderId가 order-item 단위로 반복 등장 — .find() 금지, filter+flatMap)
  const orderIds = [...new Set(content.map((o) => o.orderId))];
  const rows = [];
  for (const orderId of orderIds) {
    const parts = content.filter((o) => o.orderId === orderId);
    const items = parts.flatMap((o) => o.orderItems || []);
    for (const item of items) {
      rows.push({
        orderId,
        skuName: item.skuName || '',
        skuBarcode: item.extra?.skuBarcode || '',
        skuCode: item.skuCode || '',
        businessSkuCode: item.businessSkuCode || '',
        storageTypeName: item.storageTypeName || '',
        supplyPrice: item.supplyPrice ?? '',
        requestQuantity: item.requestQuantity ?? '',
        skuQuantityOfBox: item.extra?.skuQuantityOfBox || '',
        skuExpirationGuide: item.extra?.skuExpirationGuide || '',
        orderStatusName: item.orderStatusName || '',
        warehousePlaceName: normalizeCenterName(item.warehousePlaceName),
      });
    }
  }

  // 상온/냉동 혼재 체크
  const storageTypes = [...new Set(rows.map((r) => r.storageTypeName).filter(Boolean))];
  console.log(`발주 ${orderIds.length}건, 품목 ${rows.length}개, 보관온도: ${storageTypes.join('/')}`);
  if (storageTypes.length > 1) {
    const counts = storageTypes.map((t) => `${t} ${rows.filter((r) => r.storageTypeName === t).length}건`).join(', ');
    console.log(`[!] 상온/냉동 혼재 감지: ${counts}`);
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('OrderDetail');
  const headers = [
    '순서', '상품명', '바코드', 'B마트코드', '거래처 상품 코드', '보관온도', '매입단가',
    '총 발주 수량', '총 입고 수량', '차이', '최근 입고일', '박스 입수량', '입고 박스 수량',
    '발주 금액', '유통기한 가이드', '제조일 가이드', '상태', '센터',
  ];
  ws.addRow(headers);
  rows.forEach((r, i) => {
    ws.addRow([
      i + 1,
      r.skuName,
      r.skuBarcode,
      r.skuCode,
      r.businessSkuCode,
      r.storageTypeName,
      r.supplyPrice,
      r.requestQuantity,
      '', '', '',
      r.skuQuantityOfBox,
      '',
      typeof r.supplyPrice === 'number' && typeof r.requestQuantity === 'number' ? r.supplyPrice * r.requestQuantity : '',
      r.skuExpirationGuide,
      '',
      r.orderStatusName,
      r.warehousePlaceName,
    ]);
  });

  const listFile = path.join(outDir, `비마트_발주목록_${dateLabel}.xlsx`);
  const aggFile = path.join(outDir, `비마트_발주서_취합_${dateLabel}.xlsx`);

  // 발주목록(원본 content 그대로, 참고용) — 취합양식과 별개로 raw content 요약 저장
  const wbList = new ExcelJS.Workbook();
  const wsList = wbList.addWorksheet('OrderList');
  wsList.addRow(['orderId', 'orderNo', 'requestDate', 'supplierVendorName', 'logisticsVendorName', 'orderDeliveryTypeName', 'skuName', 'skuCode', 'requestQuantity', 'orderStatusName', 'warehouseName', 'warehousePlaceName']);
  for (const o of content) {
    for (const item of o.orderItems || []) {
      wsList.addRow([o.orderId, o.orderNo, o.requestDate, o.supplierVendorName, o.logisticsVendorName, o.orderDeliveryTypeName, item.skuName, item.skuCode, item.requestQuantity, item.orderStatusName, item.warehouseName, item.warehousePlaceName]);
    }
  }
  await wbList.xlsx.writeFile(listFile);
  await wb.xlsx.writeFile(aggFile);

  console.log('저장 완료:');
  console.log(' -', listFile);
  console.log(' -', aggFile);
}

main().catch((err) => {
  console.error('실패:', err.message);
  process.exit(1);
});
