require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');

async function clearExt6() {
  try {
    console.log('[ClearData] Fetching POIs...');
    const data = await googleSheetsService.getSheetData();
    if (!data || data.length < 2) return;

    const headers = data[0];
    const rows = data.slice(1);
    const ext6Idx = headers.indexOf('ext_6');

    if (ext6Idx === -1) {
      console.error('Column ext_6 not found in sheet!');
      return;
    }

    let clearedCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row[ext6Idx]) {
        const updatedRowValues = [...row];
        updatedRowValues[ext6Idx] = ''; // Clear the logo ID
        
        console.log(`[ClearData] Clearing row ${i + 2}...`);
        await googleSheetsService.updateRow(i, updatedRowValues);
        clearedCount++;
      }
    }

    console.log(`[ClearData] Finished. Cleared ${clearedCount} locations.`);
  } catch (err) {
    console.error('[ClearData] ERROR:', err);
  }
}

clearExt6();
