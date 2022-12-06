const Message = require("../models/message");

const numPerPage = 10;

// @route GET /messages/:conversation_id/:page_number
// @description Get messages for a conversation
// @access Public
exports.message_get_page = (req, res, next) => {
    const pageNumber = req.params.page_number;
    Message.find({ conversation_id: req.params.conversation_id })
        .sort({ _id: 1 })
        .skip(pageNumber > 0 ? (pageNumber - 1) * numPerPage : 0)
        .limit(numPerPage)
        .then((message) => {
            res.json(message);
        })
        .catch((err) =>
            res.status(404).json({ messagesFound: "No messages found" })
        );
};
