import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  console.log('--- Inisialisasi Skema Database E-Commercequ ---');

  // Load .env manual jika ada
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        process.env[key] = val;
      }
    });
  }

  let connection;
  try {
    if (process.env.DATABASE_URL) {
      console.log('Menghubungkan via DATABASE_URL...');
      connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        multipleStatements: true,
        ssl: process.env.DATABASE_URL.includes('ssl=') ? undefined : {
          rejectUnauthorized: false,
        },
      });
    } else {
      console.log('Menghubungkan via host DB individual...');
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ecommercequ',
        multipleStatements: true,
      });
    }

    const schemaPath = path.resolve(__dirname, '../src/lib/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Mengeksekusi skema tabel...');
    await connection.query(schemaSql);

    console.log('✅ Skema tabel dan seed awal berhasil diinisialisasi!');
  } catch (error) {
    console.error('❌ Gagal menginisialisasi database:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();

