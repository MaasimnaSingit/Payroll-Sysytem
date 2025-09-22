require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = require('./index');
const initAutoBackup = require('./cron/autoBackup');

const PORT = Number(process.env.PORT || 8080);
const dataDir = path.resolve(process.env.DATA_DIR || './data');
const uploadsDir = path.resolve(process.env.UPLOADS_DIR || './uploads');

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

app.listen(PORT, () => console.log(`[server] listening on :${PORT}`));
initAutoBackup(app);


