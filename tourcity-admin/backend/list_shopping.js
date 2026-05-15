require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');

async function listMalls() {
  const data = await googleSheetsService.getSheetData();
  const headers = data[0];
  const rows = data.slice(1);
  const nameIdx = headers.indexOf('name_ru');
  const catIdx = headers.indexOf('category');

  console.log('--- Current Shopping Locations ---');
  rows.forEach(row => {
    if (row[catIdx] === 'shopping') {
      console.log(`- ${row[nameIdx]}`);
    }
  });
}

listMalls();
