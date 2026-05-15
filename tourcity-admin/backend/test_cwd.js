const dotenv = require('dotenv');
console.log("CWD:", process.cwd());
const result = dotenv.config();
console.log("Dotenv parsed:", result.parsed);
console.log("SERVICES_SPREADSHEET_ID:", process.env.SERVICES_SPREADSHEET_ID);
