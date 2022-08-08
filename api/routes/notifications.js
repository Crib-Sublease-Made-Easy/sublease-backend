const express = require("express");
const router = express.Router();
const NotificationController = require('../controller/notifications');
const checkAuth = require('../middleware/check-auth');


router.post("/sendMessage", checkAuth, NotificationController.send_message);

module.exports = router;