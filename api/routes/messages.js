const express = require("express");
const router = express.Router();

const MessagesController = require("../controller/messages");

router.get(
    "/:conversation_id/:page_number",
    MessagessController.message_get_page
);

module.exports = router;
