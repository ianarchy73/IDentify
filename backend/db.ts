import 'dotenv/config';
import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise';

const databaseName = process.env.DB_NAME || 'identify_db';

export const db: Pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: databaseName,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  timezone: 'Z',
});

export async function checkDatabaseConnection(): Promise<void> {
  const connection = await db.getConnection();
  try {
    await connection.ping();
    console.log(`Connected to MySQL database: ${databaseName}`);
  } finally {
    connection.release();
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  await db.end();
}

export async function query<T extends RowDataPacket[] | ResultSetHeader[]>(
  sql: string,
  values: unknown[] = [],
): Promise<T> {
  const [result] = await db.execute<T>(sql, values);
  return result;
}
