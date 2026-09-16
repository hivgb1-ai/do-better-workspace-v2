// 사용법: node fetch_inbound.js 2026-07-31 2026-08-02
// WMS(입고현황, 품목별)를 로그인해서 직접 조회하고 결과를 화면에 요약 + JSON 파일로 저장한다.
const fs = require('fs');
const path = require('path');
const { WmsSession, loadEnv } = require('./wms_client.js');

async function main() {
  const [dateFrom, dateTo] = process.argv.slice(2);
  if (!dateFrom || !dateTo) {
    console.error('사용법: node fetch_inbound.js <시작일 YYYY-MM-DD> <종료일 YYYY-MM-DD>');
    console.error('예시:   node fetch_inbound.js 2026-07-31 2026-08-02');
    process.exit(1);
  }

  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('.env 파일이 없습니다. .env.example을 복사해서 .env로 만들고 본인 WMS 아이디/비밀번호를 채워주세요.');
    process.exit(1);
  }
  const env = loadEnv(envPath);
  if (!env.WMS_USERNAME || !env.WMS_PASSWORD) {
    console.error('.env에 WMS_USERNAME / WMS_PASSWORD가 비어있습니다.');
    process.exit(1);
  }

  const session = new WmsSession();
  await session.login(env.WMS_USERNAME, env.WMS_PASSWORD);
  console.log(`로그인 성공: ${session.username}`);

  const rows = await session.fetchInboundByReceivedDate(dateFrom, dateTo);
  console.log(`조회 기간: ${dateFrom} ~ ${dateTo} (입고일자 기준)`);
  console.log(`총 ${rows.length}건`);

  const byDate = {};
  let totalQty = 0;
  rows.forEach(r => {
    byDate[r.입고일자] = (byDate[r.입고일자] || 0) + 1;
    totalQty += (r.입고수량 || 0);
  });
  console.log('날짜별 건수:', byDate);
  console.log('총 입고수량:', totalQty.toLocaleString());

  const outName = `입고현황_${dateFrom.replace(/-/g, '')}-${dateTo.replace(/-/g, '')}.json`;
  const outPath = path.join(process.cwd(), outName);
  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2), 'utf8');
  console.log(`결과 저장: ${outPath}`);
}

main().catch(e => {
  console.error('에러:', e.message);
  process.exit(1);
});
