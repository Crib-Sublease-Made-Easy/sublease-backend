const express = require("express");
const router = express.Router();

const UserController = require('../controller/users');
const checkAuth = require('../middleware/check-auth');

router.post("/signup", UserController.user_signup);
router.post("/login", UserController.user_login);
router.delete("/:id", UserController.user_delete);
router.put("/:id", UserController.user_modify);
router.get("/", UserController.user_get_all);
router.get("/:id",checkAuth, UserController.user_get_one);

module.exports = router;