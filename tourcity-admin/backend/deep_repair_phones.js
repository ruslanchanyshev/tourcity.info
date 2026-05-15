require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');

async function deepRepair() {
    console.log('[Repair] 🛠 Starting deep phone repair...');
    
    try {
        // We use valueRenderOption: 'FORMULA' to see what's actually in the cell
        const rawRows = await googleSheetsService.getSheetData(null, { valueRenderOption: 'FORMULA' });
        if (!rawRows || rawRows.length <= 1) return;
        
        const headers = rawRows[0];
        const dataRows = rawRows.slice(1);
        const phoneIdx = headers.indexOf('phone');
        const nameIdx = headers.indexOf('name_en');
        
        let fixCount = 0;
        
        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            let phone = (row[phoneIdx] || '').toString().trim();
            
            // If it starts with + but no apostrophe, or is just the number that Google broke
            if (phone.startsWith('+')) {
                const fixedPhone = "'" + phone;
                console.log(`[Repair] Fixing Row ${i+2} (${row[nameIdx]}): ${phone} -> ${fixedPhone}`);
                
                // Construct the full row to update
                const updatedRow = [...row];
                updatedRow[phoneIdx] = fixedPhone;
                
                await googleSheetsService.updateRow(i, updatedRow);
                fixCount++;
                // Small delay to avoid rate limiting
                await new Promise(r => setTimeout(r, 600));
            }
        }
        
        console.log(`[Repair] ✅ Done! Fixed ${fixCount} phone numbers.`);
        
    } catch (error) {
        console.error('[Repair] ❌ Error:', error);
    }
}

deepRepair();
