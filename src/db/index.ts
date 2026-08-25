import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import { mockDb } from './mock';

function normalizeHost(rawHost: string | undefined | null): string {
  if (!rawHost || rawHost.trim() === '' || rawHost.toLowerCase() === 'localhost') {
    return '127.0.0.1';
  }
  return rawHost.trim();
}

function getMySQLConfig() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && databaseUrl.startsWith('mysql://')) {
    try {
      const parsedUrl = new URL(databaseUrl);
      const resolvedHost = normalizeHost(parsedUrl.hostname);
      return {
        host: resolvedHost,
        port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : 3306,
        user: decodeURIComponent(parsedUrl.username || 'root'),
        password: decodeURIComponent(parsedUrl.password || ''),
        database: parsedUrl.pathname.replace(/^\//, '') || 'lockquote',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      };
    } catch {
      return databaseUrl;
    }
  }

  const rawHost = process.env.MYSQL_HOST || (process.env.MYSQL_DATABASE || process.env.MYSQL_USER ? '127.0.0.1' : null);
  if (rawHost) {
    return {
      host: normalizeHost(rawHost),
      port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'lockquote',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    };
  }

  return null;
}

const config = getMySQLConfig();

let pool: mysql.Pool | null = null;
let drizzleDb: any = null;

if (config) {
  try {
    pool = typeof config === 'string' ? mysql.createPool(config) : mysql.createPool(config);
    drizzleDb = drizzle(pool, { schema, mode: 'default' });
  } catch (err) {
    console.warn('[DB] MySQL Pool initialization notice (using memory fallback):', err);
  }
}

// Export Drizzle client (or mockDb when MySQL is not configured/offline)
export const db = drizzleDb || (mockDb as any);
export type DbClient = typeof db;

export async function checkDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  if (!pool) {
    return { connected: false, error: 'MySQL configuration is not defined.' };
  }
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { connected: true };
  } catch (err: any) {
    return { connected: false, error: err.message || 'Failed to ping MySQL server.' };
  }
}
