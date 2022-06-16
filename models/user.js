const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema ({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    age: {
        type: Number,
        required: true
    }
})

module.exports = User = mongoose.model('user', UserSchema)