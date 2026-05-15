require('dotenv').config();
const gs = require('./google-sheets.service');

async function fixCrown() {
    try {
        const rows = await gs.getSheetData();
        const headers = rows[0];
        const rowIndex = 92; // Found by index
        const row = rows[rowIndex];

        console.log('Original Row:', row);

        // Sanitize every field: remove newlines
        const sanitizedRow = row.map(cell => {
            if (typeof cell === 'string') {
                return cell.replace(/\n/g, ' ').replace(/\r/g, ' ').trim();
            }
            return cell;
        });

        // Specific fix for tags if they are still "0, 1, 2..."
        const tagsIndex = headers.indexOf('all_tags');
        if (tagsIndex !== -1 && sanitizedRow[tagsIndex].includes('0, 1')) {
            sanitizedRow[tagsIndex] = '';
        }

        console.log('Sanitized Row:', sanitizedRow);

        await gs.updateRow(rowIndex - 1, sanitizedRow); // gs.updateRow handles rowIndex by adding 2
        console.log('Successfully fixed Crown entry!');
    } catch (error) {
        console.error('Error fixing Crown:', error);
    }
}

fixCrown();
