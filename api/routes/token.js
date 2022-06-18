const express = require("express");
const router = express.Router();

const TokenController = require('../controller/token');
const checkAuth = require('../middleware/check-auth');

router.post("/accessRefresh", checkAuth, TokenController.regenerate_access_token);


module.exports = router;