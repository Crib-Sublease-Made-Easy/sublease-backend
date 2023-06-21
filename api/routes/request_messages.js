const express = require("express");
const router = express.Router();

const RequestMessages = require('../controller/request_messages');
const checkAuth = require('../middleware/check-auth');

router.post("/", checkAuth, RequestMessages.send_messages);
router.get("/:request_id", checkAuth, RequestMessages.get_messages);


module.exports = router;