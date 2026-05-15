require('dotenv').config();
const bcrypt = require('bcrypt');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const googleSheetsService = require('./google-sheets.service');

console.log('--- TourCity Partner Password Generator (Auto-Save) ---');

readline.question('Введите логин партнера (например, vintage198): ', (username) => {
  readline.question('Введите желаемый пароль: ', async (password) => {
    readline.question('Введите ID заведения (через запятую, если несколько): ', async (poiId) => {
      readline.question('Уровень доверия (trusted или regular): ', async (trustLevel) => {
        readline.question('Срок действия аккаунта (например, 31.12.2026) или пусто: ', async (expirationDate) => {
          
          try {
            console.log('Шифрование пароля...');
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            
            console.log('Подключение к Google Sheets...');
            const sid = googleSheetsService.defaultSpreadsheetId;
            
            const rowData = [
              username.trim(),
              hash,
              poiId.trim(),
              'active',
              trustLevel.trim() || 'regular',
              expirationDate.trim()
            ];

            await googleSheetsService.appendRow(sid, rowData, 'Partners');
            
            console.log('\n✅ УСПЕШНО! Партнер автоматически добавлен в базу.');
            console.log(`Логин: ${username}`);
            console.log(`Пароль: ${password} (передайте его владельцу)`);
            console.log(`Заведения: ${poiId}`);
            console.log(`Модерация: ${trustLevel}`);
            if (expirationDate) console.log(`Действует до: ${expirationDate}`);
            
          } catch (e) {
            console.error('❌ ОШИБКА:', e.message);
          } finally {
            readline.close();
            process.exit(0);
          }
        });
      });
    });
  });
});
