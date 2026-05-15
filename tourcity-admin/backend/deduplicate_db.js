require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');

async function deduplicateAndMerge() {
    console.log('[Deduplicator] 🚀 Starting database cleanup and smart merging...');
    
    try {
        const rawRows = await googleSheetsService.getSheetData();
        if (!rawRows || rawRows.length <= 1) return console.log('No data found.');
        
        const headers = rawRows[0];
        const dataRows = rawRows.slice(1);
        
        // Map to quickly find column index by header name
        const getIdx = (name) => headers.indexOf(name);
        const nameIdx = getIdx('name_en');
        const tagsIdx = getIdx('ext_5');
        const phoneIdx = getIdx('phone');
        
        const groups = {}; // Key: normalized name, Value: array of rows
        
        dataRows.forEach(row => {
            const name = (row[nameIdx] || '').toLowerCase().trim();
            if (!name) return;
            if (!groups[name]) groups[name] = [];
            groups[name].push(row);
        });
        
        const cleanDataRows = [];
        let mergeCount = 0;

        for (const name in groups) {
            const group = groups[name];
            if (group.length === 1) {
                cleanDataRows.push(group[0]);
                continue;
            }
            
            // WE HAVE DUPES! Start merging.
            console.log(`[Deduplicator] Merging ${group.length} entries for: "${group[0][nameIdx]}"`);
            
            // Create a Master Record initialized with the first row
            const master = [...group[0]];
            
            // Merge logic for all other rows in the group
            for (let i = 1; i < group.length; i++) {
                const competitor = group[i];
                
                headers.forEach((header, colIdx) => {
                    const masterVal = (master[colIdx] || '').toString().trim();
                    const compVal = (competitor[colIdx] || '').toString().trim();
                    
                    if (header === 'ext_5') {
                        // SMART MERGE TAGS
                        const mTags = masterVal.split(/;|,/).map(t => t.trim()).filter(Boolean);
                        const cTags = compVal.split(/;|,/).map(t => t.trim()).filter(Boolean);
                        const combined = [...new Set([...mTags, ...cTags])];
                        master[colIdx] = combined.join('; ');
                    } else if (header === 'phone') {
                        // Keep the phone if master is empty or competitor has a longer/valid phone
                        if (!masterVal || (compVal.length > masterVal.length && !compVal.includes('ERROR'))) {
                            master[colIdx] = compVal;
                        }
                    } else if (!['id', '_rowIndex'].includes(header)) {
                        // For general fields, keep the longest description/value
                        if (compVal.length > masterVal.length) {
                            master[colIdx] = compVal;
                        }
                    }
                });
            }
            
            cleanDataRows.push(master);
            mergeCount += (group.length - 1);
        }
        
        // Final sanity check: sort by original order or category if preferred
        // We'll keep them in the order they were first encountered.
        
        const finalSheetArray = [headers, ...cleanDataRows];
        
        console.log(`[Deduplicator] Cleanup complete.`);
        console.log(`- Original Rows: ${rawRows.length}`);
        console.log(`- Unique Rows: ${finalSheetArray.length}`);
        console.log(`- Rows Removed: ${mergeCount}`);
        
        // DO THE WIPE AND REWRITE
        await googleSheetsService.clearAndWriteBatch(finalSheetArray);
        
        console.log(`[Deduplicator] ✅ Database is now clean and deduplicated!`);
        
    } catch (error) {
        console.error('[Deduplicator] ❌ FATAL ERROR:', error);
    }
}

deduplicateAndMerge();
