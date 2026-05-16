const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const googleSheetsService = require('./google-sheets.service');

const JWT_SECRET = process.env.JWT_SECRET || 'tourcity_super_secret_key_123';

// Helper: Read the Partners tab from a specific database
async function getPartners(mode) {
  const sid = googleSheetsService.getSpreadsheetId(mode);
  const data = await googleSheetsService.getSheetData(sid, 'Partners!A:F');
  if (!data || data.length < 2) return [];
  return data.slice(1).map(row => {
    return {
      username: row[0] || '',
      passwordHash: row[1] || '',
      poiIds: (row[2] || '').split(',').map(s => s.trim()).filter(Boolean),
      status: row[3] || 'active',
      trustLevel: row[4] || 'regular',
      expirationDate: row[5] || ''
    };
  });
}

// 1. Partner Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Логин и пароль обязательны' });

  try {
    const cleanUsername = username.trim().toLowerCase();
    
    // Smart Login: check Places first, then Services
    let mode = 'places';
    let partners = await getPartners(mode);
    let partner = partners.find(p => p.username.toLowerCase() === cleanUsername);
    
    if (!partner) {
      mode = 'services';
      partners = await getPartners(mode);
      partner = partners.find(p => p.username.toLowerCase() === cleanUsername);
    }
    
    if (!partner) return res.status(401).json({ error: 'Неверный логин или пароль' });
    if (partner.status !== 'active') return res.status(403).json({ error: 'Аккаунт заблокирован' });

    console.log(`[AUTH] Checking password for user: ${partner.username} in mode: ${mode}`);
    const isValid = await bcrypt.compare(password, partner.passwordHash);
    console.log(`[AUTH] Password valid: ${isValid}`);
    
    if (!isValid) return res.status(401).json({ error: 'Неверный логин или пароль' });

    const token = jwt.sign({ 
      username: partner.username, 
      poiIds: partner.poiIds,
      trustLevel: partner.trustLevel,
      expirationDate: partner.expirationDate,
      mode: mode
    }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ token, poiIds: partner.poiIds, trustLevel: partner.trustLevel, expirationDate: partner.expirationDate, mode: mode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера авторизации' });
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'Отсутствует токен доступа' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Токен истек или недействителен' });
    req.partner = decoded;
    next();
  });
};

// 2. Fetch specific POIs data for the partner
router.get('/pois', verifyToken, async (req, res) => {
  try {
    const sid = googleSheetsService.getSpreadsheetId(req.partner.mode);
    const rows = await googleSheetsService.getSheetData(sid);
    const headers = rows[0];
    
    const allowedIds = req.partner.poiIds;
    const targetPois = [];

    for (let i = 1; i < rows.length; i++) {
      const obj = { _rowIndex: i - 1 };
      headers.forEach((header, colIndex) => {
        obj[header] = rows[i][colIndex] || '';
      });
      if (allowedIds.includes(obj.id)) {
        // Backwards compatibility for partner portal
        if (!obj.size_discount && obj.ext_2) obj.size_discount = obj.ext_2;
        if (!obj.exp_discount && obj.ext_3) obj.exp_discount = obj.ext_3;
        if (!obj.info_discount && obj.ext_4) obj.info_discount = obj.ext_4;
        
        // Contacts compatibility
        if (!obj.inst && obj.website) obj.inst = obj.website;
        if (!obj.tg && obj.tg_bot) obj.tg = obj.tg_bot;
        if (!obj.wtsp && obj.phone) obj.wtsp = obj.phone;
        if (!obj.site && obj.ext_1) obj.site = obj.ext_1;

        targetPois.push(obj);
      }
    }

    res.json({ pois: targetPois, mode: req.partner.mode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Save POI Edits
router.patch('/pois/:id', verifyToken, async (req, res) => {
  const targetId = req.params.id;
  const { trustLevel, poiIds, username } = req.partner;
  
  if (!poiIds.includes(targetId)) {
    return res.status(403).json({ error: 'Нет прав на редактирование этого заведения' });
  }

  const updatedPoi = req.body;
  
  try {
    if (trustLevel === 'trusted') {
      // Direct save to actual DB
      const sid = googleSheetsService.getSpreadsheetId(req.partner.mode);
      const rows = await googleSheetsService.getSheetData(sid);
      const headers = rows[0];
      
      const rowIndex = updatedPoi._rowIndex;
      if (rowIndex === undefined) return res.status(400).json({ error: 'Missing _rowIndex' });

      const values = headers.map(header => updatedPoi[header] !== undefined ? updatedPoi[header] : '');
      await googleSheetsService.updateRow(sid, rowIndex, values);
      return res.json({ success: true, message: 'Сохранено напрямую' });
      
    } else {
      // Save to Pending_Edits in the correct DB
      const sid = googleSheetsService.getSpreadsheetId(req.partner.mode);
      const timestamp = new Date().toISOString();
      const payload = JSON.stringify(updatedPoi);
      
      // We assume Pending_Edits has columns: Timestamp, Username, TargetID, JSONPayload, Status
      await googleSheetsService.appendRow(sid, [timestamp, username, targetId, payload, 'pending'], 'Pending_Edits');
      return res.json({ success: true, message: 'Отправлено на модерацию' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Delete Event (direct, no moderation — for emergency cancellations)
router.delete('/pois/:id/event', verifyToken, async (req, res) => {
  const targetId = req.params.id;
  const { poiIds } = req.partner;

  if (!poiIds.includes(targetId)) {
    return res.status(403).json({ error: 'Нет прав на редактирование этого заведения' });
  }

  try {
    const sid = googleSheetsService.getSpreadsheetId(req.partner.mode);
    const rows = await googleSheetsService.getSheetData(sid);
    const headers = rows[0];

    // Find the row for this POI
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][headers.indexOf('id')] === targetId) {
        rowIndex = i - 1;
        break;
      }
    }

    if (rowIndex === -1) return res.status(404).json({ error: 'POI не найден' });

    // Build the full row with event fields cleared
    const currentRow = rows[rowIndex + 1];
    const updatedRow = [...currentRow];

    const eventFields = ['ext_7', 'ext_8', 'ext_9', 'ext_10', 'ext_11'];
    eventFields.forEach(field => {
      const colIdx = headers.indexOf(field);
      if (colIdx !== -1) updatedRow[colIdx] = '';
    });

    await googleSheetsService.updateRow(sid, rowIndex, updatedRow);
    return res.json({ success: true, message: 'Событие удалено' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
