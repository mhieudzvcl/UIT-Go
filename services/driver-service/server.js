import express from "express";
import dotenv from "dotenv";
import pool from "./db.js"; // file vừa tạo ở bước trên

dotenv.config();
const app = express();
app.use(express.json());

// Health check
app.get("/healthz", (_, res) => res.json({ status: "ok" }));

// ✅ Lấy danh sách tất cả tài xế
app.get("/drivers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM drivers");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching drivers:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// ✅ Tìm tài xế gần vị trí (mock)
app.get("/drivers/search", (req, res) => {
  const { lat, lng } = req.query;
  res.json({
    id: 1,
    name: "Driver A",
    distance: 1.2,
    lat,
    lng,
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`🚗 DriverService running on port ${PORT}`));
