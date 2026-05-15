require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');

async function checkPois() {
  try {
    const data = await googleSheetsService.getSheetData();
    if (!data || data.length === 0) {
      console.log('No data found');
      return;
    }
    const headers = data[0];
    const rows = data.slice(1);
    
    const nameRuIdx = headers.indexOf('name_ru');
    const nameEnIdx = headers.indexOf('name_en');
    const ext6Idx = headers.indexOf('ext_6');

    console.log(`Headers: ${headers.join(', ')}`);
    console.log(`Indices: name_ru=${nameRuIdx}, name_en=${nameEnIdx}, ext_6=${ext6Idx}`);

    rows.forEach((row, idx) => {
      console.log(`Row ${idx + 2}: RU="${row[nameRuIdx]}", EN="${row[nameEnIdx]}", EXT6="${row[ext6Idx] || ''}"`);
    });
  } catch (err) {
    console.error(err);
  }
}

checkPois();
