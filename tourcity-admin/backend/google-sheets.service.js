const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

class GoogleSheetsService {
    constructor() {
        this.defaultSpreadsheetId = process.env.SPREADSHEET_ID;
        this.servicesSpreadsheetId = process.env.SERVICES_SPREADSHEET_ID;
        this.serviceAccountPath = path.join(__dirname, 'service-account.json');
        this.auth = new google.auth.GoogleAuth({
            keyFile: this.serviceAccountPath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    }

    // Helper to get the correct spreadsheet ID based on mode
    getSpreadsheetId(mode) {
        if (mode === 'services') return process.env.SERVICES_SPREADSHEET_ID || process.env.SPREADSHEET_ID;
        return process.env.SPREADSHEET_ID;
    }

    // Helper to ensure data doesn't contain raw newlines
    sanitizeValues(values) {
        return values.map(val => {
            if (typeof val === 'string') {
                return val.replace(/\r?\n|\r/g, ' ').trim();
            }
            return val;
        });
    }

    async getFirstSheetProperties(spreadsheetId) {
        try {
            const spreadsheet = await this.sheets.spreadsheets.get({
                spreadsheetId: spreadsheetId || this.defaultSpreadsheetId,
            });
            return spreadsheet.data.sheets[0].properties;
        } catch (error) {
            console.error('Error fetching spreadsheet metadata:', error);
            throw error;
        }
    }

    async getFirstSheetName(spreadsheetId) {
        const props = await this.getFirstSheetProperties(spreadsheetId);
        return props.title;
    }

    async getSheetData(spreadsheetId, range, options = {}) {
        try {
            const sid = spreadsheetId || this.defaultSpreadsheetId;
            if (!range) {
                const sheetName = await this.getFirstSheetName(sid);
                range = `${sheetName}!A:AZ`;
            }
            const params = {
                spreadsheetId: sid,
                range,
                ...options
            };
            const response = await this.sheets.spreadsheets.values.get(params);
            return response.data.values;
        } catch (error) {
            console.error('Error fetching sheet data:', error);
            throw error;
        }
    }

    async updateRow(spreadsheetId, rowIndex, values, customSheetName = null) {
        try {
            const sid = spreadsheetId || this.defaultSpreadsheetId;
            const sheetName = customSheetName || await this.getFirstSheetName(sid);
            const rangeToUpdate = `${sheetName}!A${rowIndex + 2}:AZ${rowIndex + 2}`;
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: sid,
                range: rangeToUpdate,
                valueInputOption: 'USER_ENTERED',
                resource: { values: [this.sanitizeValues(values)] },
            });
        } catch (error) {
            console.error('Error updating row:', error);
            throw error;
        }
    }

    async appendRow(spreadsheetId, values, customSheetName = null) {
        try {
            const sid = spreadsheetId || this.defaultSpreadsheetId;
            const sheetName = customSheetName || await this.getFirstSheetName(sid);
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: sid,
                range: `${sheetName}!A:A`,
                valueInputOption: 'USER_ENTERED',
                resource: { values: [this.sanitizeValues(values)] },
            });
        } catch (error) {
            console.error('Error appending row:', error);
            throw error;
        }
    }

    async getSheetIdByName(spreadsheetId, sheetName) {
        const spreadsheet = await this.sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId || this.defaultSpreadsheetId,
        });
        const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
        return sheet ? sheet.properties.sheetId : null;
    }

    async deleteRow(spreadsheetId, rowIndex, customSheetName = null) {
        try {
            const sid = spreadsheetId || this.defaultSpreadsheetId;
            let sheetId;
            
            if (customSheetName) {
                sheetId = await this.getSheetIdByName(sid, customSheetName);
            } else {
                const props = await this.getFirstSheetProperties(sid);
                sheetId = props.sheetId;
            }

            if (sheetId === null) throw new Error(`Sheet ${customSheetName} not found`);

            const startIndex = rowIndex + 1;
            const endIndex = startIndex + 1;

            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: sid,
                resource: {
                    requests: [
                        {
                            deleteDimension: {
                                range: {
                                    sheetId: sheetId,
                                    dimension: 'ROWS',
                                    startIndex: startIndex,
                                    endIndex: endIndex,
                                },
                            },
                        },
                    ],
                },
            });
        } catch (error) {
            console.error('Error deleting row:', error);
            throw error;
        }
    }

    async clearAndWriteBatch(spreadsheetId, rows) {
        try {
            const sid = spreadsheetId || this.defaultSpreadsheetId;
            const sheetName = await this.getFirstSheetName(sid);
            await this.sheets.spreadsheets.values.clear({
                spreadsheetId: sid,
                range: `${sheetName}!A:AZ`,
            });

            await this.sheets.spreadsheets.values.update({
                spreadsheetId: sid,
                range: `${sheetName}!A1`,
                valueInputOption: 'USER_ENTERED',
                resource: { values: rows.map(r => this.sanitizeValues(r)) },
            });
        } catch (error) {
            console.error('Error in clearAndWriteBatch:', error);
            throw error;
        }
    }
}

module.exports = new GoogleSheetsService();
