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
        required: false
    },
    dob: {
        type: String,
        required: true
    },
    authy_id: {
        type: Number,
        required: false
    },
    profilePic:{
        type: String,
        required: true
    },
    school:{
        type: String,
        required: true
    },
    occupation:{
        type: String,
        required: true
    },
    postedProperties: {
        type: [String],
        required: true
    },
    favoriteProperties: {
        type: [String],
        required: true
    },
    otpSuccessful:{
        type: Boolean,
        required: true
    }
})

module.exports = User = mongoose.model('user', UserSchema)