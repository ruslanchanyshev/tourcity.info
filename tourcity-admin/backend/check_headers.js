require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');

async function checkHeaders() {
  const data = await googleSheetsService.getSheetData();
  console.log(data[0]);
}

checkHeaders();
