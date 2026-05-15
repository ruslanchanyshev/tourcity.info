require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');
const ScraperService = require('./scraper.service');

async function fetchMissingPhones() {
    console.log('[PhoneFetcher] 🚀 Starting process to fill missing phone numbers...');
    
    const scraper = require('./scraper.service');
    const rows = await googleSheetsService.getSheetData();
    if (!rows || rows.length <= 1) {
        console.log('[PhoneFetcher] No data found.');
        return;
    }
    
    const headers = rows[0];
    const phoneIdx = headers.indexOf('phone');
    const mapsUrlIdx = headers.indexOf('ext_1');
    const nameIdx = headers.indexOf('name_en');
    
    if (phoneIdx === -1 || mapsUrlIdx === -1) {
        console.error('[PhoneFetcher] Columns "phone" or "ext_1" (maps url) not found!');
        return;
    }

    let updatedCount = 0;
    
    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        const currentPhone = (row[phoneIdx] || '').trim();
        const mapsUrl = (row[mapsUrlIdx] || '').trim();
        const name = row[nameIdx] || `Row ${rowIndex + 1}`;
        
        // Check if phone is missing or contains error text
        if (!currentPhone || currentPhone === '' || currentPhone.toLowerCase().includes('error')) {
            if (mapsUrl && mapsUrl.includes('google.com/maps') || mapsUrl.includes('goo.gl')) {
                console.log(`[PhoneFetcher] Investigating [${name}] via ${mapsUrl}...`);
                
                try {
                    const details = await scraper.parseGoogleMapsLink(mapsUrl);
                    
                    if (details && details.phone && details.phone !== '') {
                        console.log(`[PhoneFetcher] Found phone for [${name}]: ${details.phone}`);
                        
                        // Prepare the full row for update
                        const updatedRow = [...row];
                        // Force it as text with ' to avoid Google Sheets #ERROR! formula logic
                        updatedRow[phoneIdx] = `'${details.phone}`;
                        
                        await googleSheetsService.updateRow(rowIndex - 1, updatedRow); // updateRow uses 0-based data index (rowIndex 1 is data index 0)
                        updatedCount++;
                        
                        console.log(`[PhoneFetcher] ✅ Row updated.`);
                        
                        // Wait to avoid rate limits
                        await new Promise(r => setTimeout(r, 1500));
                    } else {
                        console.log(`[PhoneFetcher] ℹ️ No phone number found in metadata for [${name}].`);
                    }
                } catch (err) {
                    console.error(`[PhoneFetcher] ❌ Error scraping [${name}]:`, err.message);
                }
            } else {
                console.log(`[PhoneFetcher] Skipping [${name}] - no valid Maps URL.`);
            }
        }
    }
    
    console.log(`[PhoneFetcher] 🏁 Process finished! Successfully added ${updatedCount} phone numbers.`);
}

fetchMissingPhones().catch(console.error);
