const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema ({
    userId: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true,
    },
    endpoint: {
        type: String,
        required: true
    },
    body: {
        type: Object,
        required: true
    }
})

module.exports = ActivityLog = mongoose.model('activity_log', ActivityLogSchema) 