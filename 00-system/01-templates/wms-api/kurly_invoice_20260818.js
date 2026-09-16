const fs = require('fs');
const path = require('path');

const [, , token, orderIdsCsv, outDir] = process.argv;
const orderIds = orderIdsCsv.split(',').map((s) => s.trim());

const ORDER_TYPE_LABEL = {
  NORMAL: '일반발주', EVENT: '행사발주(일특/라방)', EXHIBITION: '행사발주(기획/특가)',
  EMERGENCY: '긴급발주', NEW: '신상품발주', MDREQUEST: 'MD요청발주', REQUEST: '공급사 요청발주',
  AUTO: '자동발주', REORDER: '재발주',
};

async function fetchSpec(id) {
  const res = await fetch(`https://api.escm.kurly.com/api/v2/purchaseorders/document/${id}/specification/pdf`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`spec ${id} HTTP ${res.status}`);
  const json = await res.json();
  return json.result;
}

async function fetchTemplate(hasWayPoint) {
  const url = hasWayPoint
    ? 'https://partner.kurly.com/ReportTemplate/PurchaseOrderTemplate/forwarder_invoice.html'
    : 'https://partner.kurly.com/ReportTemplate/PurchaseOrderTemplate/direct_invoice.html';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`template fetch HTTP ${res.status}`);
  let text = await res.text();
  text = text.split('REPORT_URL').join('https://escm-api-admin.kurly.services');
  return text;
}

function buildMappingData(spec) {
  const items = (spec.purchaseOrderPdfItems || []).map((it) => ({
    ROW_NUM: it.rowNum,
    SELLING_TYPE: it.sellingType,
    MASTER_CODE: it.masterCode,
    ALTERNATIVE_CODE: it.alternativeCode,
    GOODS_NAME: it.goodsName,
    TOTAL_QNTY: it.totalQnty,
    SHELF_LIFE_DATE: it.shelfLifeDate,
    MANUFACTURE_DATE: it.manufactureDate,
    BOX_QNTY: it.boxQnty,
    BOX_PER_QNTY: it.boxPerQnty,
    GROSS_WEIGHT: it.grossWeight,
    INSPECTION: it.inspection ? '<span style="color:#C00500;font-weight:bold">검품대상</span>' : '',
    REMARKS: it.inspection && it.remarks ? ' / ' + it.remarks : (it.remarks || ''),
    SUPPLIER_REMARKS: it.supplierRemarks ? '<br/>' + it.supplierRemarks : '',
  }));

  let nowWaitingQr = '';
  if (!(spec.releaseProcess || []).every?.((p) => p === 'PARCEL')) {
    // best-effort per doc; leave empty if unsure
  }

  return {
    PURCHASE_ORDER_CODE: spec.purchaseOrderCode,
    PURCHASE_ORDER_DATE: spec.purchaseOrderDate,
    WAREHOUSE_NAME: spec.warehouseName,
    DOCK_NAME: spec.dockName,
    IS_DAWN_RECEIVING: spec.isDawnReceiving,
    RECEIVING_TIME_TYPE: spec.receivingTimeTypeValue,
    CONTACT_NUMBER: spec.contactNumber,
    DOCK_ADDRESS: spec.dockAddress,
    DOCK_PARCEL_ADDRESS: spec.dockParcelAddress,
    RECEIVING_ESTIMATE_DATE: spec.receivingEstimateDate,
    TEMPERATURE_CAUTION: spec.temperatureCaution,
    PURCHASE_ORDER_MANAGER: spec.purchaseOrderManager,
    PURCHASE_ORDER_MANAGER_EMAIL: spec.purchaseOrderManagerEmail,
    SUPPLIER_NAME: spec.supplierName,
    SUPPLIER_CODE: spec.supplierCode,
    SUPPLIER_MANAGER_INFOS: spec.supplierManagerInfos,
    SUPPLIER_LICENSE_NUMBER: spec.supplierLicenseNumber,
    SUPPLIER_ADDRESS: spec.supplierAddress,
    WAY_POINT_NAME: spec.wayPointName,
    WAY_POINT_ADDRESS: spec.wayPointAddress,
    LAST_RECEIVING_ESTIMATE_DATE: spec.lastReceivingEstimateDate,
    ORDER_TYPE: ORDER_TYPE_LABEL[spec.orderType] || spec.orderType,
    PURCHASE_ORDER_PDF_ITEMS: items,
    INSPECTION_TITLE: spec.hasInspection ? '<br /><span style="font-size:13px">(검품대상 상품 포함)</span>' : '',
    NOW_WAITING_QR_CODE: '',
  };
}

async function downloadPdf(htmlTemplate, downloadFileName, pdfFileName, mappingData) {
  const res = await fetch('https://api.escm.kurly.com/api-report/v1/purchase-order/report-download', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      htmlTemplate,
      downloadFileName,
      pdfDataList: [{ pdfFileName, mappingData }],
    }),
  });
  if (!res.ok) throw new Error(`report-download HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  for (const id of orderIds) {
    const spec = await fetchSpec(id);
    const hasWayPoint = !!spec.hasWayPoint;
    const template = await fetchTemplate(hasWayPoint);
    const mappingData = buildMappingData(spec);
    const fileLabel = `${spec.warehouseName}(${spec.dockName})_${spec.purchaseOrderCode}`;
    const pdf = await downloadPdf(template, fileLabel, fileLabel, mappingData);
    const outPath = path.join(outDir, `${fileLabel}.pdf`);
    fs.writeFileSync(outPath, pdf);
    console.log('저장:', outPath, `(${pdf.length} bytes)`);
  }
}

main().catch((e) => {
  console.error('실패:', e.message);
  process.exit(1);
});
