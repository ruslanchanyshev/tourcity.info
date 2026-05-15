require('dotenv').config();
const { google } = require('googleapis');
async function test() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SERVICES_SPREADSHEET_ID,
      range: 'A1:Z1',
    });
    console.log('Success:', res.data.values);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
