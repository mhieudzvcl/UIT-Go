const bcrypt = require("bcrypt");
const User = require("../models/user.model");

exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ error: "Thiếu dữ liệu!" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hash,
    });

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Failed to register" });
  }
};

exports.me = (req, res) => {
  res.json(req.user);
};
