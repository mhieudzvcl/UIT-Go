import dotenv from 'dotenv';
import pkg from 'pg';
dotenv.config();
const { Pool } = pkg;

const connectionString =
  process.env.DB_URL ||
  process.env.PGURL ||
  'postgres://postgres:password@driver-db:5432/driverdb'

export const pool = new Pool({
  connectionString,
});

export async function q(text, params) {
  const res = await pool.query(text, params);
  return res;
}
