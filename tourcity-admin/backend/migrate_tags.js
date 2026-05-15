const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

const TAG_MAP = {
  'seafood': 'tag_search_seafood',
  'sushi': 'tag_search_sushi',
  'meat': 'tag_search_meat',
  'local_food': 'tag_search_local_food',
  'pizza': 'tag_search_pizza',
  'burger': 'tag_search_burger',
  'vegan': 'tag_search_vegan',
  'coffee': 'tag_search_coffee',
  'dessert': 'tag_search_dessert',
  'rooftop': 'tag_search_rooftop',
  'sea_view': 'ocean_access', // mapping sea_view to ocean_access or just remove it if sunset_view is better
  'club': 'tag_search_club',
  'romantic': 'tag_search_romantic',
  'karaoke': 'tag_search_karaoke',
  'souvenir': 'tag_search_souvenir',
  'pharmacy': 'tag_search_pharmacy',
  'supermarket': 'tag_search_supermarket',
  'pool_venue': 'tag_search_pool_venue',
  'live_music_venue': 'tag_search_live_music_venue'
};

async function migrate() {
  console.log('Fetching POIs...');
  const res = await axios.get(`${API_URL}/pois?mode=places`);
  const pois = res.data;
  
  let updatedCount = 0;

  for (const poi of pois) {
    let needsUpdate = false;
    let newExt5 = poi.ext_5 || '';
    let newAllTags = poi.all_tags || '';

    // Function to process a comma/semicolon separated string
    const processTags = (str) => {
      if (!str) return str;
      const tags = str.split(/[;,]+/).map(t => t.trim()).filter(Boolean);
      let changed = false;
      const newTags = tags.map(t => {
        if (TAG_MAP[t]) {
          changed = true;
          return TAG_MAP[t];
        }
        return t;
      });
      return { changed, resultString: [...new Set(newTags)].join('; ') };
    };

    const ext5Result = processTags(newExt5);
    const allTagsResult = processTags(newAllTags);

    if (ext5Result.changed || allTagsResult.changed) {
      console.log(`\nMigrating: ${poi.name_ru || poi.id}`);
      if (ext5Result.changed) console.log(`  ext_5: ${newExt5} -> ${ext5Result.resultString}`);
      if (allTagsResult.changed) console.log(`  all_tags: ${newAllTags} -> ${allTagsResult.resultString}`);
      
      poi.ext_5 = ext5Result.resultString;
      poi.all_tags = allTagsResult.resultString;
      
      try {
        await axios.patch(`${API_URL}/pois/${poi._rowIndex}?mode=places`, poi);
        console.log(`  -> Successfully saved ${poi.id}`);
        updatedCount++;
      } catch (e) {
        console.error(`  -> Failed to save ${poi.id}:`, e.message);
      }
    }
  }

  console.log(`\nMigration complete. Updated ${updatedCount} POIs.`);
}

migrate();
