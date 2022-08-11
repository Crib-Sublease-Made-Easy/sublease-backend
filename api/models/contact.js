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

module.exports = Contact = mongoose.model('contact', ContactSchema) 