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
    email: {
        type: String,
        required: true
    },
    password: { 
        type: String,
        required: true 
    },
    gender: { 
        type: String,
        required: true 
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    authy_id: {
        type: Number,
        required: true
    },
    profilePic:{
        type: String,
        required: true
    },
    postedProperties: {
        type: [String],
        required: true
    }
})

module.exports = User = mongoose.model('user', UserSchema)