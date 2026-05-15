const axios = require('axios');
const fs = require('fs');

async function upload() {
    try {
        const data = fs.readFileSync('/Users/rch/tourcity.info/tourcity-admin/scratch/new_pois.json', 'utf8');
        const pois = JSON.parse(data);
        
        console.log(`Starting upload of ${pois.length} POIs...`);
        let successCount = 0;
        
        for (const poi of pois) {
            try {
                // Post to your local backend API
                await axios.post('http://localhost:3001/api/pois', poi);
                console.log(`[SUCCESS] Added: ${poi.name_ru}`);
                successCount++;
            } catch (err) {
                console.error(`[ERROR] Failed to add ${poi.name_ru}: ${err.message}`);
            }
        }
        
        console.log(`\nUpload complete! Successfully added ${successCount} out of ${pois.length} POIs to Google Sheets.`);
    } catch (e) {
        console.error("Critical error:", e.message);
    }
}

upload();
