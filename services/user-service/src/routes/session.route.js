const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.controller")

// Login route mounted at /api/sessions
router.post("/", userController.login)

module.exports = router
