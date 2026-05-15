require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');

async function findGoldCoast() {
  const data = await googleSheetsService.getSheetData();
  const headers = data[0];
  const rows = data.slice(1);
  const nameIdx = headers.indexOf('name_ru');
  const catIdx = headers.indexOf('category');

  console.log('--- Gold Coast Check ---');
  let found = false;
  rows.forEach((row, i) => {
    const name = (row[nameIdx] || '').toLowerCase();
    if (name === 'gold coast' || name === 'голд кост') {
      console.log(`Found Mall at Row ${i+2}: ${row[nameIdx]} (${row[catIdx]})`);
      found = true;
    }
  });

  if (!found) {
    console.log('Exact match for "Gold Coast" mall not found.');
    console.log('Searching for similar names...');
    rows.forEach((row, i) => {
      const name = (row[nameIdx] || '').toLowerCase();
      if (name.includes('gold coast') || name.includes('голд кост')) {
        console.log(`- Row ${i+2}: ${row[nameIdx]} (${row[catIdx]})`);
      }
    });
  }
}

findGoldCoast();
