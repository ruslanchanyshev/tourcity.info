require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');

function isValidDate(dateString) {
  if (!dateString) return true; // No date means infinite discount usually
  const formats = [/^\d{4}-\d{2}-\d{2}$/, /^\d{2}\.\d{2}\.\d{4}$/, /^\d{2}\/\d{2}\/\d{4}$/];
  if (!formats.some(fmt => fmt.test(dateString.trim()))) return false;
  
  // Basic logical check for invalid dates like 31.04
  const parts = dateString.trim().split(/[.\-/]/);
  let day, month, year;
  if (dateString.includes('-')) {
    [year, month, day] = parts.map(Number);
  } else {
    [day, month, year] = parts.map(Number);
  }
  
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

async function auditsExpirations() {
  try {
    const data = await googleSheetsService.getSheetData();
    const headers = data[0];
    const rows = data.slice(1);
    const nameRuIdx = headers.indexOf('name_ru');
    const ext2Idx = headers.indexOf('ext_2');
    const ext3Idx = headers.indexOf('ext_3');

    console.log('Auditing discount cards...');
    rows.forEach((row, i) => {
      const discount = row[ext2Idx];
      const expiry = row[ext3Idx];
      if (discount && discount.trim() !== '') {
        const valid = isValidDate(expiry);
        if (!valid) {
          console.log(`INVALID DATE: Row ${i + 2} | Name: ${row[nameRuIdx]} | Date: ${expiry}`);
        } else if (expiry && expiry.trim() !== '') {
            // console.log(`OK: Row ${i+2} | Name: ${row[nameRuIdx]} | Date: ${expiry}`);
        }
      }
    });
  } catch (err) {
    console.error(err);
  }
}

auditsExpirations();
