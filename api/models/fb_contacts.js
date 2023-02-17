const mongoose = require('mongoose');

const  FBContactsSchema= new mongoose.Schema ({
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
    }
})

module.exports = FBContacts = mongoose.model('fb_contacts', FBContactsSchema) 