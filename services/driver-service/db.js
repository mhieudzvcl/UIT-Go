import dotenv from 'dotenv';
import pkg from 'pg';
dotenv.config();
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.PGURL || 'postgres://driver:driverpwd@localhost:5432/driverdb',
});

export async function q(text, params) {
  const res = await pool.query(text, params);
  return res;
}
export default pool;
