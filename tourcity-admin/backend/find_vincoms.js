require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');

async function findMalls() {
  const data = await googleSheetsService.getSheetData();
  const headers = data[0];
  const rows = data.slice(1);
  const nameIdx = headers.indexOf('name_ru');
  const catIdx = headers.indexOf('category');
  const addrIdx = headers.indexOf('address');

  const terms = ['vincom', 'винком', 'lotte', 'лотте', 'gold coast', 'nha trang center', 'ab central', 'horizon'];

  console.log('--- Search Results (Case Insensitive) ---');
  rows.forEach((row, i) => {
    const name = (row[nameIdx] || '').toLowerCase();
    const addr = (row[addrIdx] || '').toLowerCase();
    
    if (terms.some(t => name.includes(t) || addr.includes(t))) {
      console.log(`[Row ${i+2}] ${row[catIdx]} | Name: ${row[nameIdx]} | Addr: ${row[addrIdx]}`);
    }
  });
}

findMalls();
