const mongoose = require('mongoose');

const RequestMessagesSchema = new mongoose.Schema ({
    requestId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    senderId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    timeStamp: {
        type: Date,
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
})

module.exports = RequestMessages = mongoose.model('request_messages', RequestMessagesSchema) 