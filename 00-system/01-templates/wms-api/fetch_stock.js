// 사용법: node fetch_stock.js
// WMS(재고조회 화면, "화주x창고x로케이션별" 탭)를 로그인해서 직접 조회하고
// 발주서검증도구_웹.html이 그대로 업로드해서 쓸 수 있는 xlsx로 저장한다.
// 기본은 화주명="이그니스"만 필터링(다른 화주 데이터는 파일에 담지 않음).
const fs = require('fs');
const path = require('path');
const { WmsSession, loadEnv } = require('./wms_client.js');
const { buildWorkbook } = require('./stock_mapping.js');

const ORG_FILTER = '이그니스';
const OUT_DIR = 'C:/Users/admin/do-better-workspace-v2/10-projects/5. 실시간 재고현황';

function findEnvPath() {
  const local = path.join(__dirname, '.env');
  if (fs.existsSync(local)) return local;
  const repoRoot = path.join(__dirname, '..', '..', '..', '.env');
  if (fs.existsSync(repoRoot)) return repoRoot;
  return local; // 없으면 로컬 경로 기준으로 에러 메시지 출력
}

function pad2(n) { return String(n).padStart(2, '0'); }

async function main() {
  const envPath = findEnvPath();
  if (!fs.existsSync(envPath)) {
    console.error('.env 파일을 찾지 못했습니다 (wms-api 폴더 또는 워크스페이스 루트). .env.example을 참고해 WMS_USERNAME/WMS_PASSWORD를 채워주세요.');
    process.exit(1);
  }
  const env = loadEnv(envPath);
  if (!env.WMS_USERNAME || !env.WMS_PASSWORD) {
    console.error(`${envPath} 에 WMS_USERNAME / WMS_PASSWORD가 비어있습니다.`);
    process.exit(1);
  }

  const session = new WmsSession();
  await session.login(env.WMS_USERNAME, env.WMS_PASSWORD);
  console.log(`로그인 성공: ${session.username}`);

  const rows = await session.fetchStockByOrgWhLoc(ORG_FILTER);
  console.log(`재고현황 조회 완료: 화주="${ORG_FILTER}" 기준 ${rows.length}건`);
  if (rows.length === 0) {
    console.error('조회된 행이 없습니다. 화주명 필터 또는 계정 권한을 확인하세요.');
    process.exit(1);
  }

  const wb = await buildWorkbook(rows);

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const now = new Date();
  const yy = pad2(now.getFullYear() % 100), mm = pad2(now.getMonth() + 1), dd = pad2(now.getDate());
  const hh = pad2(now.getHours()), mi = pad2(now.getMinutes());
  const outPath = path.join(OUT_DIR, `${yy}${mm}${dd}_${hh}${mi}_실시간 재고.xlsx`);
  await wb.xlsx.writeFile(outPath);
  console.log(`저장 완료: ${outPath}`);
}

main().catch(e => {
  console.error('에러:', e.message);
  process.exit(1);
});
