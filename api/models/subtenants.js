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
        }
    }
)

module.exports = Subtenant = mongoose.model('subtenants', SubtenantSchema)
