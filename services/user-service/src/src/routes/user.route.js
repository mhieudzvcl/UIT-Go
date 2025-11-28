const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.controller")
const auth = require("../middlewares/auth")

router.post("/", userController.register)
router.post("/sessions", userController.login) // backward compatible
router.get("/me", auth, userController.me)
router.get("/:id", auth, userController.getUserById)

module.exports = router
