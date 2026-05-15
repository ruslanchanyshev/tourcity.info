require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');

async function fixDates() {
  try {
    const data = await googleSheetsService.getSheetData();
    const headers = data[0];
    const rows = data.slice(1);
    const nameRuIdx = headers.indexOf('name_ru');
    const ext3Idx = headers.indexOf('ext_3');

    const toFix = [
      { name: "CHEKHOV Coffee&food", wrong: "2026-04-31", right: "2026-04-30" },
      { name: "Egoist Mediterranean Restaurant", wrong: "31.04.2026", right: "30.04.2026" }
    ];

    let fixedCount = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const match = toFix.find(f => f.name === row[nameRuIdx]);
      if (match && row[ext3Idx] === match.wrong) {
        console.log(`Fixing ${match.name}: ${match.wrong} -> ${match.right}`);
        const updatedRow = [...row];
        updatedRow[ext3Idx] = match.right;
        await googleSheetsService.updateRow(i, updatedRow);
        fixedCount++;
      }
    }
    console.log(`Done. Fixed ${fixedCount} rows.`);
  } catch (err) {
    console.error(err);
  }
}

fixDates();
