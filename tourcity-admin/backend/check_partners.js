require('dotenv').config();
const service = require('./google-sheets.service.js');

async function check() {
  try {
    const data = await service.getSheetData(process.env.GOOGLE_SHEETS_SPREADSHEET_ID, 'Partners!A:D');
    console.log("SUCCESS", data);
  } catch (err) {
    console.error("ERROR", err.message);
  }
}
check();
