const ExcelJS = require('exceljs');
const filePath = process.argv[2];
(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  console.log('sheets:', wb.worksheets.map((w) => w.name));
  const ws = wb.getWorksheet('BASE');
  if (!ws) return console.log('no BASE sheet');
  console.log('rows:', ws.rowCount);
  console.log('header:', ws.getRow(1).values.slice(1));
  for (let r = 2; r <= 4; r++) console.log(r, ws.getRow(r).values.slice(1));
})();
