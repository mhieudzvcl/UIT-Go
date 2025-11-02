import express from "express";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();
const app = express();
app.use(express.json());

// 📘 Lấy thanh toán theo ID
app.get("/payments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM payments WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching payment:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// 📘 Ước tính chi phí (giữ nguyên)
app.post("/payments/estimate", (req, res) => {
  const { distance_km } = req.body;
  res.json({ amount: distance_km * 10000 });
});

// 📘 Thanh toán (giữ nguyên)
app.post("/payments/charge", (req, res) => {
  const { trip_id, amount } = req.body;
  res.json({ trip_id, amount, status: "charged" });
});

// 📘 Health check
app.get("/healthz", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`💳 PaymentService running on port ${PORT}`));
