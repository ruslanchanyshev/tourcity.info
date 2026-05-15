const axios = require('axios');
require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');

const SERP_API_KEY = process.env.SERP_API_KEY;

async function fetchReviews(name) {
  try {
    console.log(`[SerpAPI] Searching for ${name}...`);
    // 1. Search for the place to get data_id (for reviews)
    const searchRes = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_maps',
        q: name,
        api_key: SERP_API_KEY
      }
    });

    const place = searchRes.data.place_results || (searchRes.data.local_results && searchRes.data.local_results[0]);
    if (!place || !place.data_id) {
      console.log(`[SerpAPI] Could not find data_id for ${name}`);
      return null;
    }

    const dataId = place.data_id;
    console.log(`[SerpAPI] Found data_id: ${dataId}. Fetching reviews...`);

    // 2. Fetch reviews
    const reviewsRes = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_maps_reviews',
        data_id: dataId,
        api_key: SERP_API_KEY,
        sort_by: 'rating', // Get best reviews
        hl: 'ru' // Prefer Russian reviews if available
      }
    });

    const reviews = (reviewsRes.data.reviews || [])
      .slice(0, 5)
      .map(r => r.snippet)
      .filter(Boolean);

    return {
      name,
      reviews
    };
  } catch (err) {
    console.error(`[SerpAPI] Error fetching ${name}:`, err.message);
    return null;
  }
}

async function start() {
  const pois = [
    "Radisson Blu Resort, Cam Ranh", "Orbit Resort & Spa Nha Trang", "Crown Nguyen Hoang Hotel",
    "Best Western Premier Marvella Nha Trang Hotel", "Melissa Nha Trang Hotel", "The Signature Hotel Nha Trang",
    "Mercure Nha Trang Beach", "Star City", "Adamas Boutique Hotel Nha Trang", "Citadines Bayfront",
    "Galina Hotel", "Северный пляж Nha trang", "Oceanus apartments", "Nha Trang Horizon Hotel",
    "La Cala Mare", "La Cala - Gusto Italiano", "Miss Macarons 2", "Miss Macarons", "OASIS, Halal.."
  ];

  const results = [];
  for (const name of pois) {
    const data = await fetchReviews(name);
    if (data) {
      results.push(data);
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('---RESULT_START---');
  console.log(JSON.stringify(results, null, 2));
  console.log('---RESULT_END---');
}

start();
