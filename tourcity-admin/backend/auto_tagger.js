require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');

const MALL_MAPPING = [
  { namePart: 'vincom plaza (tran phu)', id: 'mall_vincom_tranphu' },
  { namePart: 'vincom plaza tran phu', id: 'mall_vincom_tranphu' },
  { namePart: 'винком плаза тран фу', id: 'mall_vincom_tranphu' },
  { namePart: 'винком ле тхань тон', id: 'mall_vincom_lethanhton' },
  { namePart: 'vincom plaza (le thanh ton)', id: 'mall_vincom_lethanhton' },
  { namePart: 'vincom plaza le thanh ton', id: 'mall_vincom_lethanhton' },
  { namePart: 'gold coast', id: 'mall_goldcoast' },
  { namePart: 'ab central', id: 'mall_ab' },
  { namePart: 'nha trang center', id: 'mall_ntc' },
  { namePart: 'lotte mart nha trang', id: 'mall_lottemart' },
  { namePart: 'lotte mart', id: 'mall_lottemart' },
  { namePart: 'go! nhatrang', id: 'mall_go' },
  { namePart: 'co.opmart', id: 'mall_coop' },
];

async function runAutoTagger() {
  console.log('--- Starting Auto Tagger ---');
  const data = await googleSheetsService.getSheetData();
  const headers = data[0];
  const rows = data.slice(1);
  
  const nameRuIdx = headers.indexOf('name_ru');
  const nameEnIdx = headers.indexOf('name_en');
  const tagsIdx = headers.indexOf('all_tags');
  
  let updatedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const nameRu = (row[nameRuIdx] || '').toLowerCase();
    const nameEn = (row[nameEnIdx] || '').toLowerCase();
    const currentTags = (row[tagsIdx] || '');
    
    let matchedMall = null;
    for (const mapping of MALL_MAPPING) {
      if (nameRu.includes(mapping.namePart) || nameEn.includes(mapping.namePart)) {
        matchedMall = mapping.id;
        break;
      }
    }

    if (matchedMall) {
      const tagToAdd = matchedMall;
      const tagsArray = currentTags.split(/[;,]+/).map(t => t.trim()).filter(Boolean);
      
      if (!tagsArray.includes(tagToAdd)) {
        tagsArray.push(tagToAdd);
        const newTags = tagsArray.join('; ');
        
        console.log(`Updating Row ${i+2}: ${row[nameRuIdx]} -> Add tag ${tagToAdd}`);
        
        // Reconstruct the full row mapping object
        const updatedPoiObject = {};
        headers.forEach((header, index) => {
          updatedPoiObject[header] = row[index] || '';
        });
        
        // Update the specific field
        updatedPoiObject['all_tags'] = newTags;
        
        // Convert back to array in header order
        const valuesToUpdate = headers.map(header => updatedPoiObject[header]);
        
        // updateRow takes (rowIndex_relative_to_data, valuesArray)
        // rowIndex in updateRow is: data_index (0, 1, 2)
        // So we pass i
        await googleSheetsService.updateRow(i, valuesToUpdate);
        updatedCount++;
      }
    }
  }

  console.log(`--- Finished. Updated ${updatedCount} rows. ---`);
}

runAutoTagger();
