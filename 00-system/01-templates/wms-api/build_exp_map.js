const fs = require('fs');
const ExcelJS = require('exceljs');

const [, , masterPath, pickingPath, outJsonPath] = process.argv;

async function main() {
  const wbMaster = new ExcelJS.Workbook();
  await wbMaster.xlsx.readFile(masterPath);
  const base = wbMaster.getWorksheet('BASE');
  const wmsToMaster = {}; // WMS 출고기준코드 -> 마스터코드
  for (let r = 3; r <= base.rowCount; r++) {
    const row = base.getRow(r).values;
    const wmsCode = row[1];
    const masterCode = row[10];
    if (wmsCode && masterCode) wmsToMaster[String(wmsCode).trim()] = String(masterCode).trim();
  }
  console.log('마스터 매핑 건수:', Object.keys(wmsToMaster).length);

  const wbPick = new ExcelJS.Workbook();
  await wbPick.xlsx.readFile(pickingPath);
  const pick = wbPick.getWorksheet(1);
  const header = pick.getRow(1).values;
  console.log('피킹지시 헤더:', header.slice(1));
  const wmsToExp = {}; // WMS 품목코드 -> 소비기한
  for (let r = 2; r <= pick.rowCount; r++) {
    const row = pick.getRow(r).values;
    const wmsCode = row[1];
    const exp = row[18];
    if (wmsCode) wmsToExp[String(wmsCode).trim()] = exp;
  }
  console.log('피킹지시 품목 건수:', Object.keys(wmsToExp).length);

  const masterCodeToExp = {}; // 마스터코드 -> 소비기한
  const unresolvedWmsCodes = [];
  for (const [wmsCode, exp] of Object.entries(wmsToExp)) {
    const masterCode = wmsToMaster[wmsCode];
    if (!masterCode) {
      unresolvedWmsCodes.push(wmsCode);
      continue;
    }
    if (masterCodeToExp[masterCode] && String(masterCodeToExp[masterCode]) !== String(exp)) {
      console.log(`[!] 마스터코드 ${masterCode} 소비기한 충돌: 기존 ${masterCodeToExp[masterCode]} vs 신규 ${exp} (wmsCode ${wmsCode})`);
    }
    masterCodeToExp[masterCode] = exp;
  }
  if (unresolvedWmsCodes.length) {
    console.log('마스터 매핑 안된 WMS코드:', unresolvedWmsCodes);
  }
  console.log('최종 마스터코드->소비기한 매핑 건수:', Object.keys(masterCodeToExp).length);
  fs.writeFileSync(outJsonPath, JSON.stringify(masterCodeToExp, null, 2), 'utf8');
  console.log('저장:', outJsonPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
