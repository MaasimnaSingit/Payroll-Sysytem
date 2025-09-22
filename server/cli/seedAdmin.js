require('dotenv').config();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.resolve(process.env.DATA_DIR || './data');
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'app.sqlite');

const db = new Database(dbPath);
const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || 'admin123';

const row = db.prepare(`SELECT id FROM users WHERE role='ADMIN_HR'`).get();
if (row) {
  console.log('Admin already exists (single-admin enforced). Nothing to do.');
  process.exit(0);
}
const hash = bcrypt.hashSync(password, 10);
db.prepare(`INSERT INTO users(username,password_hash,role,status,must_change_password)
            VALUES(?, ?, 'ADMIN_HR', 'Active', 0)`).run(username, hash);

console.log(`✔ Admin created: ${username} / ${password}`);


