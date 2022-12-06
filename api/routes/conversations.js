const express = require("express");
const router = express.Router();

const ConversationsController = require("../controller/conversations");

router.get(
    "/:user_id/:page_number",
    checkAuth,
    ConversationsController.conversation_get_page
);

module.exports = router;
