const express = require("express");
const router = express.Router();
const ChatController = require('../controller/chat');

router.put("/hide/:query", ChatController.hide_channel);


module.exports = router;