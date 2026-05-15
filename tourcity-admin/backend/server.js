require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const googleSheetsService = require('./google-sheets.service');
const scraperService = require('./scraper.service');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const partnerRoutes = require('./partner.routes');
app.use('/api/partner', partnerRoutes);

const adminPartnerRoutes = require('./admin-partners.routes');
app.use('/api/admin/partners', adminPartnerRoutes);

// Helper to get spreadsheet ID from request
const getSid = (req) => {
    const mode = req.query.mode;
    const sid = googleSheetsService.getSpreadsheetId(mode);
    console.log(`[DEBUG] mode: ${mode}, SID: ${sid}`);
    return sid;
};

// 1. Get all POIs from Sheet
app.get('/api/pois', async (req, res) => {
    try {
        const sid = getSid(req);
        const rows = await googleSheetsService.getSheetData(sid);
        // Convert array of arrays to array of objects using headers
        if (!rows || rows.length === 0) return res.json([]);
        
        const headers = rows[0];
        const data = rows.slice(1).map((row, index) => {
            const obj = { _rowIndex: index };
            headers.forEach((header, i) => {
                obj[header] = row[i] || '';
            });
            return obj;
        });
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Parse Google Maps Link
app.post('/api/parse', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    try {
        const details = await scraperService.parseGoogleMapsLink(url);
        res.json(details);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Update POI
app.patch('/api/pois/:index', async (req, res) => {
    const rowIndex = parseInt(req.params.index);
    const updatedPoi = req.body;
    
    try {
        const sid = getSid(req);
        // We need to fetch headers first to ensure correct column mapping
        const rows = await googleSheetsService.getSheetData(sid);
        const headers = rows[0];
        
        // Map object back to array ordered by headers
        const values = headers.map(header => updatedPoi[header] || '');
        
        await googleSheetsService.updateRow(sid, rowIndex, values);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Add NEW POI
app.post('/api/pois', async (req, res) => {
    const newPoi = req.body;
    
    try {
        const sid = getSid(req);
        const rows = await googleSheetsService.getSheetData(sid);
        const headers = rows[0];
        const values = headers.map(header => newPoi[header] || '');
        
        await googleSheetsService.appendRow(sid, values);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Translate via local Ollama (proxied to avoid CORS)
app.post('/api/translate', async (req, res) => {
    const { name_ru, desc_ru } = req.body;
    if (!name_ru && !desc_ru) {
        return res.status(400).json({ error: 'Не указан текст для перевода' });
    }

    const prompt = `You are a professional travel guide translator. Translate the following venue description from Russian into multiple languages. 
IMPORTANT: DO NOT TRANSLATE the "Name" field. Keep it exactly as provided in the Source for all languages. 
Keep brand names, food item names, and proper nouns in the description untranslated as well. 
Preserve formatting and style. Return ONLY valid JSON with this exact structure:
{
  "en": { "name": "...", "desc": "..." },
  "vi": { "name": "...", "desc": "..." },
  "ko": { "name": "...", "desc": "..." },
  "zh": { "name": "...", "desc": "..." },
  "fr": { "name": "...", "desc": "..." },
  "es": { "name": "...", "desc": "..." }
}

Source (Russian):
Name: ${name_ru || ''}
Description: ${desc_ru || ''}`;

    try {
        const ollamaRes = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'loshadka',
                prompt,
                stream: false,
                options: { temperature: 0.2 }
            })
        });

        if (!ollamaRes.ok) {
            const err = await ollamaRes.text();
            return res.status(502).json({ error: 'Ollama error: ' + err });
        }

        const ollamaJson = await ollamaRes.json();
        const raw = ollamaJson.response || '';

        // Extract JSON from the response (model may wrap it in markdown)
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return res.status(500).json({ error: 'Ollama вернул некорректный ответ', raw });
        }

        const translations = JSON.parse(jsonMatch[0]);
        res.json(translations);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. SerpApi Google Maps Parser
app.post('/api/serp-parse', async (req, res) => {
    const { q } = req.body;
    const apiKey = process.env.SERP_API_KEY;

    if (!q) return res.status(400).json({ error: 'Query is required' });
    if (!apiKey) return res.status(500).json({ error: 'SERP_API_KEY is not configured on backend' });

    try {
        console.log(`[SerpApi] Searching for: ${q}`);
        
        // 1. First, we do a general search to get the location details
        const searchUrl = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(q)}&api_key=${apiKey}&hl=ru`;
        const response = await axios.get(searchUrl);
        const data = response.data;

        // If it's a list (local_results), we take the first item. 
        // If it's a direct place result (place_results), we take that.
        const place = data.place_results || (data.local_results && data.local_results[0]);

        if (!place) {
            return res.status(404).json({ error: 'Ничего не найдено в Google Maps' });
        }

        // Map SerpApi categories to our system
        const rawType = place.type || '';
        const type = (Array.isArray(rawType) ? rawType.join(' ') : String(rawType)).toLowerCase();
        let category = 'sight';
        
        // English keywords
        if (type.includes('rest') || type.includes('food') || type.includes('kitchen') || type.includes('steak')) category = 'restaurant';
        else if (type.includes('cafe') || type.includes('coffee') || type.includes('bakery')) category = 'cafe';
        else if (type.includes('bar') || type.includes('club') || type.includes('pub') || type.includes('karaoke')) category = 'nightlife';
        else if (type.includes('shop') || type.includes('mall') || type.includes('store') || type.includes('market')) category = 'shopping';
        else if (type.includes('hotel') || type.includes('resort') || type.includes('inn') || type.includes('hostel')) category = 'hotel';
        else if (type.includes('temple') || type.includes('pagoda') || type.includes('church') || type.includes('shrine')) category = 'temple';
        else if (type.includes('beach') || type.includes('park') || type.includes('nature')) category = 'beach';
        
        // Russian keywords (fallback for hl=ru)
        if (category === 'sight') {
            if (type.includes('ресторан') || type.includes('еда') || type.includes('кухня')) category = 'restaurant';
            else if (type.includes('кафе') || type.includes('кофе') || type.includes('булочная')) category = 'cafe';
            else if (type.includes('бар') || type.includes('клуб') || type.includes('караоке')) category = 'nightlife';
            else if (type.includes('магазин') || type.includes('рынок') || type.includes('центр')) category = 'shopping';
            else if (type.includes('отель') || type.includes('гостиница') || type.includes('курорт')) category = 'hotel';
            else if (type.includes('храм') || type.includes('пагода') || type.includes('церковь')) category = 'temple';
            else if (type.includes('пляж')) category = 'beach';
        }

        // Extract pricing
        const price = place.price_range || place.price_level || '';

        // Format result
        const result = {
            id: place.title ? place.title.toLowerCase().replace(/\s+/g, '_').substring(0, 20) + '_' + Math.floor(Math.random()*1000) : 'new_poi',
            name_ru: place.title || '',
            category: category,
            address: place.address || '',
            phone: '', // User requested to skip
            website: place.website || '',
            rating: place.rating ? place.rating.toString() : '4.5',
            price: price,
            all_tags: '', // User requested to skip
            lat: place.gps_coordinates ? place.gps_coordinates.latitude.toString() : '0.0',
            lon: place.gps_coordinates ? place.gps_coordinates.longitude.toString() : '0.0',
            hours: place.operating_hours ? 'Open now' : '', 
            images: '', // User requested to skip
            ext_1: place.link || '',
            data_id: place.data_id || '' // Store for reviews
        };

        res.json(result);
    } catch (error) {
        console.error('[SerpApi] Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Ошибка SerpApi: ' + (error.response?.data?.error || error.message) });
    }
});
// 7. (Next endpoint starts here)
app.listen(PORT, () => {
    console.log(`Admin Backend running on http://localhost:${PORT}`);
});
