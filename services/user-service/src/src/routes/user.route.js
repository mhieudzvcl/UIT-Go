const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// API đăng ký người dùng
router.post("/", userController.register);

// ✅ API lấy thông tin user theo ID (dành cho TripService)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // giả lập dữ liệu hoặc query DB
    const mockUsers = {
      1: { id: 1, name: "Nguyen Van A", email: "a@gmail.com", phone: "0909000000" },
      2: { id: 2, name: "Tran Thi B", email: "b@gmail.com", phone: "0909111111" },
    };

    const user = mockUsers[id];
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
