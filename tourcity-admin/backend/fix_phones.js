require('dotenv').config();
const { google } = require('googleapis');
const googleSheetsService = require('./google-sheets.service');

async function fixPhonesDeep() {
    console.log('[PhoneFixer Deep] 🚀 Fetching raw cell data (including formulas) from Google Sheets...');
    
    try {
        const sheetName = await googleSheetsService.getFirstSheetName();
        // Native call to get detailed grid data, which includes formula string
        const response = await googleSheetsService.sheets.spreadsheets.get({
            spreadsheetId: googleSheetsService.spreadsheetId,
            includeGridData: true,
            ranges: [`${sheetName}!A:AZ`]
        });
        
        const sheet = response.data.sheets[0];
        const rowsInfo = sheet.data[0].rowData;
        
        if (!rowsInfo || rowsInfo.length <= 1) return console.log('No data found.');
        
        // Find Phone column based on first row
        const headers = rowsInfo[0].values.map(v => v.formattedValue || '');
        const phoneColIndex = headers.indexOf('phone');
        
        if (phoneColIndex === -1) {
            console.error('Phone column not found!');
            return;
        }

        let updatedCount = 0;
        
        for (let rowIndex = 1; rowIndex < rowsInfo.length; rowIndex++) {
            const row = rowsInfo[rowIndex];
            if (!row.values) continue;
            
            const cell = row.values[phoneColIndex];
            if (!cell) continue;
            
            // Is it an error?
            const isError = cell.effectiveValue && cell.effectiveValue.errorValue;
            
            // The raw string they typed in is in userEnteredValue.formulaValue or stringValue
            // If they typed `+84123`, Sheets auto-converts it to `=+84123`
            const userFormula = cell.userEnteredValue ? cell.userEnteredValue.formulaValue : null;
            
            if (isError && userFormula) {
                // it's a formula that broke (like `=+84..`)
                let rawPhone = userFormula.replace('=', '').trim();
                
                // Add leading apostrophe to force text
                const fixedPhone = `'${rawPhone}`;
                
                console.log(`[PhoneFixer] Found broken formula at Row ${rowIndex + 1}: ${userFormula} -> Fixing to ${fixedPhone}`);
                
                // We use standard values.update to overwrite just this cell
                await googleSheetsService.sheets.spreadsheets.values.update({
                    spreadsheetId: googleSheetsService.spreadsheetId,
                    range: `${sheetName}!${String.fromCharCode(65 + phoneColIndex)}${rowIndex + 1}`,
                    valueInputOption: 'USER_ENTERED',
                    resource: { values: [[fixedPhone]] }
                });
                
                updatedCount++;
                await new Promise(r => setTimeout(r, 500));
            } else if (cell.formattedValue === '#ERROR!' && cell.userEnteredValue && cell.userEnteredValue.stringValue) {
                // Just in case it's stringValue
                const rawString = cell.userEnteredValue.stringValue;
                console.log(`[PhoneFixer] Found string #ERROR! at Row ${rowIndex + 1}: ${rawString}`);
                const fixedPhone = `'${rawString.replace('=', '')}`;
                
                await googleSheetsService.sheets.spreadsheets.values.update({
                    spreadsheetId: googleSheetsService.spreadsheetId,
                    range: `${sheetName}!${String.fromCharCode(65 + phoneColIndex)}${rowIndex + 1}`,
                    valueInputOption: 'USER_ENTERED',
                    resource: { values: [[fixedPhone]] }
                });
                
                updatedCount++;
                await new Promise(r => setTimeout(r, 500));
            }
        }
        
        console.log(`[PhoneFixer] ✅ Finished! Successfully fixed ${updatedCount} broken phone numbers.`);
        
    } catch (error) {
        console.error('Error fixing phones:', error);
    }
}

fixPhonesDeep();
