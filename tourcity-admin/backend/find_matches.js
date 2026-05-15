require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');

const logos = [
  'alpaca', 'pizza_4ps', 'gold_coast', 'go_mall', 'lotte_mart', 'vincom', 
  'nha_trang_center', 'grill_garden', 'ivegan', '69slam', 'quiksilver', 'ab_square'
];

async function findMatches() {
  try {
    const data = await googleSheetsService.getSheetData();
    const headers = data[0];
    const rows = data.slice(1);
    const nameRuIdx = headers.indexOf('name_ru');
    const nameEnIdx = headers.indexOf('name_en');

    const matches = [];

    rows.forEach((row, i) => {
      const nameRu = (row[nameRuIdx] || '').toLowerCase();
      const nameEn = (row[nameEnIdx] || '').toLowerCase();
      
      logos.forEach(logo => {
        // Clean up logo name for matching (e.g. pizza_4ps -> pizza 4p)
        const searchTerms = logo.split('_');
        const isMatch = searchTerms.every(term => nameRu.includes(term) || nameEn.includes(term));
        
        if (isMatch) {
          matches.push({
            rowIndex: i,
            nameRu: row[nameRuIdx],
            nameEn: row[nameEnIdx],
            logo: logo
          });
        }
      });
    });

    console.log(JSON.stringify(matches, null, 2));
  } catch (err) {
    console.error(err);
  }
}

findMatches();
