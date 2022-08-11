const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema ({
    title: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    }
})

module.exports = User = mongoose.model('contact', ContactSchema)