// 사용법: node verify_stock_file.js [xlsx 경로]
// 인자 없으면 "10-projects/5. 실시간 재고현황" 폴더의 최신 파일을 검사.
// fetch_stock.js가 만든 파일이 발주서검증도구_웹.html의 HEADER_SANITY를 통과하는지 확인하는 회귀 점검 스크립트.
// (WMS 화면 컬럼 구성이 바뀌면 이 스크립트가 제일 먼저 걸러낸다.)
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

function resolveTarget() {
  const arg = process.argv[2];
  if (arg) return arg;
  const dir = 'C:/Users/admin/do-better-workspace-v2/10-projects/5. 실시간 재고현황';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx')).sort();
  if (!files.length) throw new Error(`${dir} 에 xlsx 파일이 없습니다.`);
  return path.join(dir, files[files.length - 1]);
}

(async () => {
  const target = resolveTarget();
  console.log('검사 파일:', target);

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(target);
  const ws = wb.worksheets[0];
  const header = ws.getRow(1).values.slice(1); // exceljs values는 1-based, index0은 undefined라 slice(1)로 0-based 배열화

  // core.js의 col(row,n) = row[n-1] 이므로, HEADER_SANITY의 숫자는 0-based 배열 인덱스가 아니라 1-based 엑셀 컬럼번호.
  const EXPECTED = { 2: '화주명', 7: '품목코드', 12: '가용수량', 26: '소비기한' };
  let ok = true;
  Object.entries(EXPECTED).forEach(([idx1based, text]) => {
    const actual = header[Number(idx1based) - 1];
    const pass = actual === text;
    if (!pass) ok = false;
    console.log(`1-based idx${idx1based} (0-based ${idx1based - 1}): expected="${text}" actual="${actual}" -> ${pass ? 'PASS' : 'FAIL'}`);
  });

  const row2 = ws.getRow(2).values.slice(1);
  console.log('1-based idx6 (할당금지여부) 샘플값:', row2[5]);
  console.log('1-based idx11 (BOX입수량) 샘플값:', row2[10]);
  console.log('1-based idx29 (로트키) 샘플값:', row2[28]);
  console.log('총 데이터 행수:', ws.rowCount - 1);
  console.log(ok ? '=== ALL ANCHOR CHECKS PASS ===' : '=== ANCHOR MISMATCH — fetch_stock.js의 COLUMNS 배열을 다시 맞춰야 함 ===');
  if (!ok) process.exit(1);
})();
