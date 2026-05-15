require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');

const MAPPINGS = [
  // Brands (Higher priority)
  { pattern: /69 SLAM/i, logo: '69slam' },
  { pattern: /QUIKSILVER/i, logo: 'quiksilver' },
  { pattern: /Pizza 4P/i, logo: 'pizza_4ps' },
  { pattern: /IVEGAN/i, logo: 'ivegan' },
  { pattern: /Alpaca|Альпака/i, logo: 'alpaca' },
  { pattern: /Grill Garden/i, logo: 'grill_garden' },

  // Malls (Lower priority)
  { pattern: /AB Central Square/i, logo: 'ab_square' },
  { pattern: /Nha Trang Center|Нячанг Центр/i, logo: 'nha_trang_center' },
  { pattern: /Vincom Plaza/i, logo: 'vincom' },
  { pattern: /LOTTE MART/i, logo: 'lotte_mart' },
  { pattern: /Gold Coast/i, logo: 'gold_coast' },
  { pattern: /Big C|Go! Mall/i, logo: 'go_mall' }
];

async function updateLogos() {
  try {
    console.log('[LogoUpdate] Fetching POIs...');
    const data = await googleSheetsService.getSheetData();
    if (!data || data.length < 2) return;

    const headers = data[0];
    const rows = data.slice(1);
    const nameRuIdx = headers.indexOf('name_ru');
    const nameEnIdx = headers.indexOf('name_en');
    const ext6Idx = headers.indexOf('ext_6');

    if (ext6Idx === -1) {
      console.error('Column ext_6 not found in sheet!');
      return;
    }

    let updatedCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nameRu = row[nameRuIdx] || '';
      const nameEn = row[nameEnIdx] || '';
      const fullName = `${nameRu} ${nameEn}`;

      for (const m of MAPPINGS) {
        if (m.pattern.test(fullName)) {
          // Update the specific cell for ext_6
          // rowIndex for updateRow should be the DATA row index (0-based)
          // GoogleSheetsService.updateRow takes values for the FULL row
          const updatedRowValues = [...row];
          updatedRowValues[ext6Idx] = m.logo;
          
          console.log(`[LogoUpdate] Matching "${nameRu}" -> ${m.logo}`);
          await googleSheetsService.updateRow(i, updatedRowValues);
          updatedCount++;
          break; // move to next POI
        }
      }
    }

    console.log(`[LogoUpdate] Finished. Updated ${updatedCount} locations.`);
  } catch (err) {
    console.error('[LogoUpdate] ERROR:', err);
  }
}

updateLogos();
