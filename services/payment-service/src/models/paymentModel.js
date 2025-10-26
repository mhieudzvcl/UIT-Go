const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const createPayment = async (payment) => {
  const { tripId, userId, driverId, amount, currency, paymentMethod } = payment;
  const res = await pool.query(
    `INSERT INTO payments (trip_id, user_id, driver_id, amount, currency, payment_method, status, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,'pending',NOW()) RETURNING *`,
    [tripId, userId, driverId, amount, currency, paymentMethod]
  );
  return res.rows[0];
};

const getPaymentById = async (id) => {
  const res = await pool.query(`SELECT * FROM payments WHERE id=$1`, [id]);
  return res.rows[0];
};

module.exports = { createPayment, getPaymentById };
