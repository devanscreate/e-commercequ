import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getDbPool(): mysql.Pool {
  if (!pool) {
    if (process.env.DATABASE_URL) {
      pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: process.env.DATABASE_URL.includes('ssl=') ? undefined : {
          rejectUnauthorized: false,
        },
      });
    } else {
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ecommercequ',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    }
  }

  return pool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const connectionPool = getDbPool();
  const [results] = await connectionPool.execute(sql, params);
  return results as T;
}

