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
    referralCode: {
        type: String,
        required: false,
        default: null
    },
    referredBy: {
        type: mongoose.Types.ObjectId,
        required: false,
        default: null
    },
    cribConnectEnrolled:{
        type: Boolean,
        required: false,
        default: false
    },
    cribConnectSubtenants:{
        type: [mongoose.Types.ObjectId],
        required: false,
        default: []
    },
    cribConnectSubtenantsContacted:{
        type: [mongoose.Types.ObjectId],
        required: false,
        default: []
    },
    messagingEnabled: {
        type: Boolean,
        required: false,
        default: true
    },
    contactedBy:{
        type: [{name: String, phoneNumber: Number}],
        required: false,
        defualt: []
    },
    countryCode:{
        type: Number,
        default: 1,
        required: true
    },
    cribPremium:{
        referralCode: {
            type: String,
            required: false
        },
        referred: {
            type: [mongoose.Types.ObjectId],
            require: false,
        },
        paymentDetails: {
            status: {
                type: Boolean,
                required: false,
                default: false
            },
            orderId: {
                type: String,
                required: false
            },
            paymentLink: {
                type: String,
                required: false,
                default: null
            },
            paymentLinkId: {
                type: String,
                required: false
            },
            paymentLinkCreatedAt: {
                type: String,
                required: false
            },
            default: {}
        },
        default: {}
       
    }
})

module.exports = User = mongoose.model('user', UserSchema)