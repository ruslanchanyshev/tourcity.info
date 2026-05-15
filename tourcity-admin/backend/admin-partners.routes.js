const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const googleSheetsService = require('./google-sheets.service');

// 1. Get all partners
router.get('/', async (req, res) => {
  try {
    const sid = googleSheetsService.getSpreadsheetId(req.query.mode);
    const data = await googleSheetsService.getSheetData(sid, 'Partners!A:F');
    if (!data || data.length < 2) return res.json([]);
    
    // We do NOT send passwords to frontend
    const partners = data.slice(1).map(row => {
      return {
        username: row[0] || '',
        poiIds: (row[2] || '').split(',').map(s => s.trim()).filter(Boolean),
        status: row[3] || 'active',
        trustLevel: row[4] || 'regular',
        expirationDate: row[5] || ''
      };
    });
    
    res.json(partners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при получении партнеров' });
  }
});

// 2. Create a new partner
router.post('/', async (req, res) => {
  const { username, password, poiIds, trustLevel, expirationDate, mode } = req.body;
  
  if (!username || !password || !poiIds || poiIds.length === 0) {
    return res.status(400).json({ error: 'Логин, пароль и хотя бы одно заведение обязательны' });
  }

  try {
    const sid = googleSheetsService.getSpreadsheetId(mode);
    
    // Check if user already exists
    const data = await googleSheetsService.getSheetData(sid, 'Partners!A:F');
    if (data && data.length > 1) {
      const existingUser = data.slice(1).find(row => row[0] === username.trim());
      if (existingUser) {
        return res.status(400).json({ error: 'Партнер с таким логином уже существует' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const rowData = [
      username.trim(),
      hash,
      poiIds.join(', '), // Save as comma separated
      'active',
      trustLevel || 'regular',
      expirationDate || ''
    ];

    await googleSheetsService.appendRow(sid, rowData, 'Partners');
    
    res.json({ success: true, message: 'Партнер успешно создан' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при создании партнера' });
  }
});

// 3. Reset partner password
router.put('/:username/password', async (req, res) => {
  const { username } = req.params;
  const { password, mode } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Новый пароль обязателен' });
  }

  try {
    const sid = googleSheetsService.getSpreadsheetId(mode);
    const data = await googleSheetsService.getSheetData(sid, 'Partners!A:F');
    if (!data || data.length < 2) return res.status(404).json({ error: 'Партнер не найден' });

    // Find partner row index
    // data[0] is headers, data[1] is row 2
    const partnerIndex = data.slice(1).findIndex(row => row[0] === username.trim());
    if (partnerIndex === -1) return res.status(404).json({ error: 'Партнер не найден' });

    const originalRow = data[partnerIndex + 1];
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Update the row. The updateRow method writes from column A. We must reconstruct the whole row.
    const updatedRow = [
      originalRow[0],
      hash,
      originalRow[2] || '',
      originalRow[3] || 'active',
      originalRow[4] || 'regular',
      originalRow[5] || ''
    ];

    await googleSheetsService.updateRow(sid, partnerIndex, updatedRow, 'Partners');

    res.json({ success: true, message: 'Пароль успешно обновлен' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при сбросе пароля' });
  }
});

// 4. Get all pending edits from both modes
router.get('/pending', async (req, res) => {
  console.log('[MODERATION] Fetching pending edits...');
  try {
    const results = [];
    const modes = ['places', 'services'];
    
    for (const mode of modes) {
      try {
        const sid = googleSheetsService.getSpreadsheetId(mode);
        console.log(`[MODERATION] Checking ${mode} (SID: ${sid})...`);
        
        const data = await googleSheetsService.getSheetData(sid, 'Pending_Edits!A:E');
        console.log(`[MODERATION] ${mode} data received: ${data ? data.length : 0} rows`);
        
        if (data && data.length > 1) {
          // Skip headers
          const rows = data.slice(1).map((row, index) => ({
            rowIndex: index, 
            timestamp: row[0] || '',
            username: row[1] || '',
            targetId: row[2] || '',
            payload: row[3] || '{}',
            status: (row[4] || 'pending').toLowerCase().trim(),
            mode: mode
          }));
          const filtered = rows.filter(r => r.status === 'pending');
          console.log(`[MODERATION] Found ${filtered.length} pending rows in ${mode}`);
          results.push(...filtered);
        }
      } catch (err) {
        console.warn(`[MODERATION] Warning: Could not read Pending_Edits for ${mode}:`, err.message);
        // Continue to next mode
      }
    }
    
    console.log(`[MODERATION] Total pending edits found: ${results.length}`);
    res.json(results);
  } catch (error) {
    console.error('[MODERATION] Critical error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Approve pending edit
router.post('/approve', async (req, res) => {
  const { mode, rowIndex, targetId, payload } = req.body;
  
  try {
    const sid = googleSheetsService.getSpreadsheetId(mode);
    const updatedPoiData = JSON.parse(payload);
    
    // 1. Get current main sheet data to find the row
    const mainRows = await googleSheetsService.getSheetData(sid);
    const headers = mainRows[0];
    const targetRowIndex = mainRows.slice(1).findIndex(row => row[headers.indexOf('id')] === targetId);
    
    if (targetRowIndex === -1) {
      throw new Error(`POI with ID ${targetId} not found in ${mode} sheet`);
    }

    const originalRow = mainRows[targetRowIndex + 1];
    const originalPoi = {};
    headers.forEach((h, i) => originalPoi[h] = originalRow[i] || '');

    // 2. Merge changes
    const mergedPoi = { ...originalPoi, ...updatedPoiData };
    
    // 3. Update main sheet
    const finalValues = headers.map(h => mergedPoi[h] !== undefined ? mergedPoi[h] : '');
    await googleSheetsService.updateRow(sid, targetRowIndex, finalValues);
    
    // 4. Delete from Pending_Edits
    await googleSheetsService.deleteRow(sid, rowIndex, 'Pending_Edits');
    
    res.json({ success: true, message: 'Изменения одобрены и применены' });
  } catch (error) {
    console.error('[MODERATION] Error approving edit:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Reject pending edit
router.post('/reject', async (req, res) => {
  const { mode, rowIndex } = req.body;
  
  try {
    const sid = googleSheetsService.getSpreadsheetId(mode);
    await googleSheetsService.deleteRow(sid, rowIndex, 'Pending_Edits');
    res.json({ success: true, message: 'Запрос удален' });
  } catch (error) {
    console.error('[MODERATION] Error rejecting edit:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
