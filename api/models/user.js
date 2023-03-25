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
    oneSignalUserId: {
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
        required: false
    },
    occupation:{
        type: String,
        required: false
    },
    postedProperties: {
        type: [String],
        required: true
    },
    favoriteProperties: {
        type: [mongoose.Types.ObjectId],
        required: true
    },
    lastActive: {
        type: Date,
        required: false
    },
    lastSearched: {
        type: String,
        required: false
    },
    type: {
        type: String,
        required: false
    },
    // cribPremium:{
    //     referralCode: {
    //         type: String,
    //         required: false
    //     },
    //     referred: {
    //         type: [String],
    //         require: false,
    //     },
    //     premiumAccount: {
    //         status: {
    //             type: Boolean,
    //             required: false
    //         },
    //         orderId: {
    //             type: String,
    //             required: false
    //         },
    //         paymentLink: {
    //             type: String,
    //             required: false,
    //             default: null
    //         },
    //         paymentLinkId: {
    //             type: String,
    //             required: false
    //         },
    //         paymentLinkCreatedAt: {
    //             type: String,
    //             required: false
    //         }
    //     }
    // }
})

module.exports = User = mongoose.model('user', UserSchema)