const mongoose = require('mongoose');

const CompletedSchema = new mongoose.Schema ({
    propId: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true,
    },
    userId: {
        type: String,
        required: true
    },
    success: {
        type: Boolean,
        required: false,
    },
    comments:{
        type: String,
        required: false,
    }
})

module.exports = Completed = mongoose.model('completed', CompletedSchema) 