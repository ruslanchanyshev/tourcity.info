const dotenv = require('dotenv');
dotenv.config();
const mode = 'services';
const servicesSpreadsheetId = process.env.SERVICES_SPREADSHEET_ID;
const defaultSpreadsheetId = process.env.SPREADSHEET_ID;
const sid = (mode === 'services') ? (servicesSpreadsheetId || defaultSpreadsheetId) : defaultSpreadsheetId;
console.log({ servicesSpreadsheetId, defaultSpreadsheetId, sid });
