const ExcelJS = require('exceljs');
const filePath = process.argv[2];
(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  wb.eachSheet((ws) => {
    console.log('=== sheet:', ws.name, 'rows:', ws.rowCount, '===');
    for (let r = 1; r <= Math.min(8, ws.rowCount); r++) {
      console.log(r, ws.getRow(r).values.slice(1));
    }
  });
})();
