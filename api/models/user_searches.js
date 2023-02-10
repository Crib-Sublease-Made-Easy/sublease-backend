const mongoose = require('mongoose');

const UserSearchesSchema = new mongoose.Schema ({
    userId: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    coords: {
        type: Array,
        required: true
    }
})

module.exports = UserSearchesSchema = mongoose.model('completed', UserSearchesSchema) 