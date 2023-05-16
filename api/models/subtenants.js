const mongoose = require('mongoose');

const SubtenantSchema = new mongoose.Schema (
    {
        name: {
            type: String,
            required: true
        },
        subleaseStart: {
            type: Date,
            required: true
        },
        subleaseEnd: {
            type: Date,
            required: true
        },
        budget: {
            type: Number,
            required: true
        },
        bio: {
            type: String,
            required: true
        },
        gender: {
            type: String,
            required: true
        },
        age:{
            type: Number,
            required: true
        },
        phoneNumber:{
            type: Number,
            required: true
        },
        sharedRoomFlexibility: {
            type: Boolean,
            required: true
        },
        roommatesFlexibility: {
            type: Boolean,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        coords: {
            type: Array,
            required: true
        },
        createdAt: {
            type: Date,
            required: true,
        },
        deleted: {
            type: Boolean,
            required: true,
            default: false 
        },
        
    }
)

module.exports = Subtenant = mongoose.model('subtenants', SubtenantSchema)
