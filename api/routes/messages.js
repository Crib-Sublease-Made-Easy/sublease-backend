const express = require("express");
const router = express.Router();

const MessagesController = require("../controller/messages");

router.get(
    "/:conversation_id/:page_number",
    MessagesController.message_get_page
);

module.exports = router;
