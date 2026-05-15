require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');
const scraperService = require('./scraper.service');
const fs = require('fs');
const path = require('path');

/**
 * РАСШИРЕННЫЙ ПАРСЕР КООРДИНАТ
 * Приоритет отдается параметрам !3d и !4d (точное положение пина),
 * затем параметру @ (центр камеры).
 */
function extractPreciseCoords(url) {
    let lat = null;
    let lon = null;

    // 1. Пытаемся найти !3d и !4d (самые точные - PIN)
    const pinMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (pinMatch) {
        lat = pinMatch[1];
        lon = pinMatch[2];
        console.log(`   [Coords] Найдена точная метка (PIN): ${lat}, ${lon}`);
    } else {
        // 2. Пытаемся найти @ (центр камеры)
        const cameraMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (cameraMatch) {
            lat = cameraMatch[1];
            lon = cameraMatch[2];
            console.log(`   [Coords] Найдена позиция камеры: ${lat}, ${lon}`);
        } else {
            // 3. Другие паттерны
            const commonMatch = url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/) || url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (commonMatch) {
                lat = commonMatch[1];
                lon = commonMatch[2];
                console.log(`   [Coords] Найдены координаты в параметрах: ${lat}, ${lon}`);
            }
        }
    }

    return { lat, lon };
}

async function startSync() {
    console.log('🚀 Запуск синхронизации координат из ссылок Google Maps...');
    
    try {
        // 1. Получаем данные из таблицы
        const rows = await googleSheetsService.getSheetData();
        if (!rows || rows.length < 2) {
            console.error('❌ Ошибка: В таблице недостаточно данных.');
            return;
        }

        const headers = rows[0];
        const iId = headers.indexOf('id');
        const iLat = headers.indexOf('lat');
        const iLon = headers.indexOf('lon');
        const iExt1 = headers.indexOf('ext_1');

        if (iId === -1 || iLat === -1 || iLon === -1 || iExt1 === -1) {
            console.error('❌ Ошибка: Не найдены необходимые колонки (id, lat, lon, ext_1).');
            return;
        }

        console.log(`📊 Загружено ${rows.length - 1} строк.`);
        
        let successCount = 0;
        let skipCount = 0;
        const updatedRows = [headers];

        // 2. Итерируемся по строкам
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const id = row[iId];
            const url = row[iExt1];
            
            console.log(`\n[${i}/${rows.length - 1}] Обработка: ${id}...`);

            if (!url || !url.includes('google.com/maps') && !url.includes('maps.app.goo.gl')) {
                console.log('   ⏩ Пропуск: Нет ссылки на Google Maps.');
                updatedRows.push(row);
                skipCount++;
                continue;
            }

            try {
                // Разрешаем короткую ссылку и парсим
                const details = await scraperService.parseGoogleMapsLink(url);
                
                // Используем наш расширенный парсер для финальной ссылки, если scraper не нашел точные
                const finalUrl = details.finalUrl || url;
                const { lat, lon } = extractPreciseCoords(finalUrl);

                if (lat && lon) {
                    const oldLat = row[iLat];
                    const oldLon = row[iLon];
                    
                    if (oldLat !== lat || oldLon !== lon) {
                        console.log(`   ✅ Обновление: [${oldLat}, ${oldLon}] -> [${lat}, ${lon}]`);
                        row[iLat] = lat;
                        row[iLon] = lon;
                        
                        // Защита от ошибок Google Sheets (#ERROR!): если значение начинается с +, добавляем апостроф
                        const rowToSync = row.map(val => {
                            const s = String(val);
                            if (s.startsWith('+')) return `'${s}`;
                            return val;
                        });

                        // Обновляем строку в Google Таблице (i-1 потому что rowIndex без хедера)
                        await googleSheetsService.updateRow(i - 1, rowToSync);
                        successCount++;
                    } else {
                        console.log('   ⏸️  Без изменений: Координаты уже актуальны.');
                    }
                } else {
                    console.log('   ⚠️  Ошибка: Не удалось извлечь координаты из ссылки.');
                }
            } catch (err) {
                console.error(`   ❌ Ошибка при обработке ${id}:`, err.message);
            }
            
            updatedRows.push(row);
        }

        console.log(`\n🏁 Завершено! Успешно обновлено: ${successCount}, Пропущено: ${skipCount}`);

        // 3. Сохраняем результат локально
        const dumpPath = path.join(__dirname, '..', 'pois_dump.json');
        const jsonOutput = updatedRows.slice(1).map(row => {
            const obj = {};
            headers.forEach((h, idx) => obj[h] = row[idx] || '');
            return obj;
        });
        
        fs.writeFileSync(dumpPath, JSON.stringify(jsonOutput, null, 2));
        console.log(`💾 Дамп сохранен в: ${dumpPath}`);

        // 4. Обновляем TourCity_Data.csv
        const csvPath = path.join(__dirname, '..', '..', 'TourCity_Data.csv');
        const csvContent = updatedRows.map(row => {
            return row.map(val => {
                const s = String(val);
                if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                    return `"${s.replace(/"/g, '""')}"`;
                }
                return s;
            }).join(',');
        }).join('\n');
        
        fs.writeFileSync(csvPath, csvContent);
        console.log(`💾 CSV обновлен: ${csvPath}`);

    } catch (error) {
        console.error('❌ Фатальная ошибка:', error);
    }
}

startSync();
