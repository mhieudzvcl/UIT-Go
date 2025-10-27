import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

pool.connect()
  .then(() => console.log('DB connected'))
  .catch(err => console.error('DB error', err));

export default pool;
