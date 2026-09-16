const fs = require('fs');

const [, , token, expMapPath, orderIdsCsv, outLogPath] = process.argv;
const expMap = JSON.parse(fs.readFileSync(expMapPath, 'utf8'));
const orderIds = orderIdsCsv.split(',').map((s) => s.trim());

// 사용자 확정 단종 품목 목록 (누적, reference_kurly-partner-portal-pdf-api.md 기준)
const DISCONTINUED = new Set([
  'M00000766375', 'M00000424357', 'M00000766379', 'M00000071926', 'M00000499972', 'M00000499964',
]);

function scheduledArrivalTime(dockCode) {
  if (dockCode.startsWith('KCL1') || dockCode.startsWith('KCH1')) return '15:00 ~ 15:59';
  if (dockCode.startsWith('GPL1') || dockCode.startsWith('GPH1')) return '14:00 ~ 14:59';
  if (dockCode.startsWith('GGL1')) return '13:00 ~ 13:59'; // 김포 상온
  if (dockCode.startsWith('GGH1')) return '14:00 ~ 14:59'; // 김포 냉동
  throw new Error('알 수 없는 dockCode: ' + dockCode);
}

function toDateStr(v) {
  if (!v) return v;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

async function getOrder(id) {
  const res = await fetch(`https://api.escm.kurly.com/api/v2/purchaseorders/${id}`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`GET ${id} HTTP ${res.status}`);
  const json = await res.json();
  return json.result;
}

async function putOrder(payload) {
  const res = await fetch('https://api.escm.kurly.com/api/v2/purchaseorders', {
    method: 'PUT',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { ok: res.ok, status: res.status, json };
}

function buildPayload(order) {
  const items = order.purchaseOrderItemDTOList;
  const unmatchedUnknown = [];
  const newItems = items.map((item) => {
    const exp = expMap[item.goodsCode];
    if (exp !== undefined) {
      return {
        ...item,
        expirationDate: toDateStr(exp),
        isExpirationDateFlag: true,
        prevExpirationDate: item.latestReceivedExpirationDate,
        sellingDeadLineDate: item.latestReceivedExpirationDate,
      };
    }
    if (DISCONTINUED.has(item.goodsCode)) {
      return {
        ...item,
        boxQnty: 0,
        boxQntyA: 0,
        boxQntyB: 0,
        totalQnty: 0,
        price: 0,
        taxPrice: 0,
        totalPrice: 0,
        expirationDate: null,
        changeReasonCode: 'PRODUCT_STOP',
        changeReasonDetail: null,
        remarks: `${item.totalQnty}->0/단종/`,
        isExpirationDateFlag: false,
        prevExpirationDate: item.latestReceivedExpirationDate,
        sellingDeadLineDate: item.latestReceivedExpirationDate,
      };
    }
    unmatchedUnknown.push({ goodsCode: item.goodsCode, goodsName: item.goodsName });
    return item;
  });

  if (unmatchedUnknown.length) {
    return { skip: true, reason: 'unmatched', unmatchedUnknown };
  }

  const anyBeforeApproval = newItems.some(
    (it) => it.changeReasonCode || (it.latestReceivedExpirationDate && it.expirationDate && it.expirationDate < toDateStr(it.latestReceivedExpirationDate))
  );

  const payload = {
    ...order,
    scheduledArrivalTime: scheduledArrivalTime(order.dockCode),
    approvalStatus: anyBeforeApproval ? 'BEFORE_APPROVAL_MD' : 'APPROVED',
    isApprovalBtn: true,
    originWayPointCode: order.wayPointCode,
    purchaseOrderItemDTOList: newItems,
  };
  return { skip: false, payload, anyBeforeApproval };
}

async function main() {
  const log = [];
  for (const id of orderIds) {
    const order = await getOrder(id);
    const built = buildPayload(order);
    if (built.skip) {
      console.log(`[SKIP] ${order.purchaseOrderCode} — 미매칭(단종목록 외) ${built.unmatchedUnknown.length}건:`, built.unmatchedUnknown);
      log.push({ code: order.purchaseOrderCode, skipped: true, unmatched: built.unmatchedUnknown });
      continue;
    }
    const res = await putOrder(built.payload);
    console.log(`[PUT] ${order.purchaseOrderCode} -> HTTP ${res.status}, success=${res.json?.result?.success ?? res.json?.success ?? 'n/a'}`);
    const after = await getOrder(id);
    console.log(`  재조회 approvalStatus: ${after.approvalStatus}`);
    log.push({
      code: order.purchaseOrderCode,
      orderId: id,
      putStatus: res.status,
      finalApprovalStatus: after.approvalStatus,
      itemCount: order.purchaseOrderItemDTOList.length,
    });
  }
  fs.writeFileSync(outLogPath, JSON.stringify(log, null, 2), 'utf8');
  console.log('로그 저장:', outLogPath);
}

main().catch((e) => {
  console.error('실패:', e.message);
  process.exit(1);
});
