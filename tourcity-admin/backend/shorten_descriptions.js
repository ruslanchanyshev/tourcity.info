require('dotenv').config();
const googleSheetsService = require('./google-sheets.service');
const axios = require('axios');

const OLLAMA_URL = 'http://localhost:11434/api/generate';

async function shortenText(text) {
  const prompt = `Сократи этот текст до 2-3 предложений. Сделай его емким, позитивным и сохрани главную суть. 
Текст: ${text}

ОТВЕТЬ ТОЛЬКО ГОТОВЫМ ТЕКСТОМ.`;

  try {
    const res = await axios.post(OLLAMA_URL, {
      model: 'loshadka',
      prompt: prompt,
      stream: false
    });
    return res.data.response.trim();
  } catch (err) {
    console.error(`Error shortening text:`, err.message);
    return text;
  }
}

async function run() {
  const rowsToFix = [110, 111, 112];
  const data = await googleSheetsService.getSheetData();
  const headers = data[0];

  for (const rowNum of rowsToFix) {
    const rowData = data[rowNum - 1];
    const currentDesc = rowData[9]; // desc_ru is index 9
    
    console.log(`\nShortening Row ${rowNum}...`);
    const shortDesc = await shortenText(currentDesc);
    console.log(`New: ${shortDesc}`);

    const values = headers.map(header => {
      if (header === 'desc_ru') return shortDesc;
      return rowData[headers.indexOf(header)] || '';
    });

    await googleSheetsService.updateRow(rowNum - 2, values);
    console.log(`Done.`);
  }
}

run();
