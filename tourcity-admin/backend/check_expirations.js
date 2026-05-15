require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');

async function checkExpirations() {
  try {
    const data = await googleSheetsService.getSheetData();
    if (!data || data.length < 2) return;

    const headers = data[0];
    const rows = data.slice(1);
    const nameRuIdx = headers.indexOf('name_ru');
    const ext2Idx = headers.indexOf('ext_2'); // Discount %
    const ext3Idx = headers.indexOf('ext_3'); // Expiration
    const ext4Idx = headers.indexOf('ext_4'); // Type

    console.log(`Checking rows...`);
    rows.slice(-10).forEach((row, i) => {
      console.log(`Row: ${row[nameRuIdx]} | Disc: ${row[ext2Idx]} | Exp: ${row[ext3Idx]} | Type: ${row[ext4Idx]}`);
    });
  } catch (err) {
    console.error(err);
  }
}

checkExpirations();
