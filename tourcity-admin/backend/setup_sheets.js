require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

async function createTabs() {
    console.log('Подключение к Google Sheets...');
    const serviceAccountPath = path.join(__dirname, 'service-account.json');
    const auth = new google.auth.GoogleAuth({
        keyFile: serviceAccountPath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Process both Places and Services DBs
    const spreadSheetIds = [
        process.env.SPREADSHEET_ID,
        process.env.SERVICES_SPREADSHEET_ID
    ];

    for (const sid of spreadSheetIds) {
        if (!sid) continue;
        console.log(`Проверка таблицы: ${sid}`);
        
        try {
            // Get existing sheets
            const res = await sheets.spreadsheets.get({ spreadsheetId: sid });
            const existingTitles = res.data.sheets.map(s => s.properties.title);
            
            const requests = [];
            
            // Need Partners?
            if (!existingTitles.includes('Partners')) {
                requests.push({
                    addSheet: { properties: { title: 'Partners' } }
                });
            }
            // Need Pending_Edits?
            if (!existingTitles.includes('Pending_Edits')) {
                requests.push({
                    addSheet: { properties: { title: 'Pending_Edits' } }
                });
            }
            
            if (requests.length > 0) {
                console.log('Создание вкладок...');
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: sid,
                    resource: { requests }
                });
            }
            
            // Add headers
            const partnersHeaders = ['Username', 'PasswordHash', 'Poi_ID', 'Status', 'TrustLevel', 'Expiration_Date'];
            const pendingHeaders = ['Timestamp', 'Username', 'Target_ID', 'JSON_Payload', 'Status'];
            
            await sheets.spreadsheets.values.update({
                spreadsheetId: sid,
                range: 'Partners!A1:F1',
                valueInputOption: 'RAW',
                resource: { values: [partnersHeaders] }
            });
            
            await sheets.spreadsheets.values.update({
                spreadsheetId: sid,
                range: 'Pending_Edits!A1:E1',
                valueInputOption: 'RAW',
                resource: { values: [pendingHeaders] }
            });
            
            console.log(`Вкладки успешно настроены в таблице ${sid}`);
        } catch (err) {
            console.error(`Ошибка при настройке таблицы ${sid}:`, err.message);
        }
    }
}

createTabs();
