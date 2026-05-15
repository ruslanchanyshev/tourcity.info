require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');

async function findMissingDescriptions() {
  try {
    const data = await googleSheetsService.getSheetData();
    if (!data || data.length < 2) return;

    const headers = data[0];
    const rows = data.slice(1);
    const nameRuIdx = headers.indexOf('name_ru');
    const descRuIdx = headers.indexOf('desc_ru');
    const ext1Idx = headers.indexOf('ext_1'); // Usually maps URL or Place ID

    const missing = [];
    rows.forEach((row, i) => {
      const name = row[nameRuIdx];
      const desc = row[descRuIdx];
      if (!desc || desc.trim().length === 0) {
        missing.push({
          index: i,
          name: name,
          mapsUrl: row[ext1Idx]
        });
      }
    });

    console.log(JSON.stringify(missing, null, 2));
  } catch (err) {
    console.error(err);
  }
}

findMissingDescriptions();
