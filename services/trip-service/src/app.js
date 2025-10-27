import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tripRoutes from './routes/trips.js';
import pool from './db.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/healthz', (_, res) => res.json({ status: 'ok' }));
app.use('/trips', tripRoutes);

pool.connect()
  .then(() => console.log('DB connected'))
  .catch(err => console.error('DB error', err));

app.listen(process.env.PORT, () => {
  console.log(`TripService running on port ${process.env.PORT}`);
});
