require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');
const axios = require('axios');

const SERP_API_KEY = process.env.SERP_API_KEY;
const OLLAMA_URL = 'http://localhost:11434/api/generate';

async function getReviews(query) {
  console.log(`Searching reviews for: ${query}`);
  try {
    const searchRes = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_maps',
        q: query,
        api_key: SERP_API_KEY,
        type: 'search'
      }
    });

    const place = searchRes.data.place_results || (searchRes.data.local_results && searchRes.data.local_results[0]);
    if (!place || !place.data_id) {
      console.log(`Place not found for ${query}`);
      return [];
    }

    const reviewsRes = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_maps_reviews',
        data_id: place.data_id,
        api_key: SERP_API_KEY,
        sort_by: 'quality'
      }
    });

    return (reviewsRes.data.reviews || []).slice(0, 5).map(r => r.snippet || r.text).filter(Boolean);
  } catch (err) {
    console.error(`Error fetching reviews for ${query}:`, err.message);
    return [];
  }
}

async function generateDescription(placeName, reviews) {
  if (reviews.length === 0) return `Современный торговый центр в самом сердце Нячанга, предлагающий широкий выбор магазинов и развлечений.`;

  const prompt = `Ниже приведены отзывы пользователей о месте "${placeName}". 
На основе этих отзывов составь описание этого места на РУССКОМ языке (3-4 предложения). 
Описание должно быть позитивным, приглашающим, но реалистичным. 
Акцентируй внимание на том, что нравится людям (сервис, выбор, атмосфера).

Отзывы:
${reviews.join('\n---\n')}

ОТВЕТЬ ТОЛЬКО ГОТОВЫМ ТЕКСТОМ ОПИСАНИЯ.`;

  try {
    const res = await axios.post(OLLAMA_URL, {
      model: 'loshadka',
      prompt: prompt,
      stream: false
    });
    return res.data.response.trim();
  } catch (err) {
    console.error(`Error generating description for ${placeName}:`, err.message);
    return `Отличное место для шопинга и отдыха в Нячанге.`;
  }
}

async function enrichMalls() {
  const targets = [
    { row: 110, query: 'Vincom Plaza Lê Thánh Tôn Nha Trang', name: 'Винком Ле Тхань Тон', tag: 'mall_vincom_lethanhton' },
    { row: 111, query: 'Gold Coast Mall Nha Trang', name: 'Gold Coast Mall Nha Trang', tag: 'mall_goldcoast' },
    { row: 112, query: 'Lotte Mart Gold Coast Nha Trang', name: 'Lottemart (Gold Coast)', tag: 'mall_goldcoast' }
  ];

  const data = await googleSheetsService.getSheetData();
  const headers = data[0];

  for (const target of targets) {
    console.log(`\nProcessing ${target.name}...`);
    const reviews = await getReviews(target.query);
    const desc = await generateDescription(target.name, reviews);
    
    // Get existing tags
    const rowData = data[target.row - 1]; // 1-based to 0-based
    const tagsIdx = headers.indexOf('all_tags');
    let currentTags = rowData[tagsIdx] || '';
    const tagsArray = currentTags.split(/[;,]+/).map(t => t.trim()).filter(Boolean);
    if (!tagsArray.includes(target.tag)) {
      tagsArray.push(target.tag);
    }
    
    const updates = {
      desc_ru: desc,
      all_tags: tagsArray.join('; ')
    };

    console.log(`New Description: ${desc}`);
    console.log(`New Tags: ${updates.all_tags}`);

    // Map object to array
    const values = headers.map(header => {
      if (updates[header] !== undefined) return updates[header];
      return rowData[headers.indexOf(header)] || '';
    });

    await googleSheetsService.updateRow(target.row - 2, values); // service expects i (data row index, row 2 is index 0)
    console.log(`Row ${target.row} updated.`);
  }
}

enrichMalls();
