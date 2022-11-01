const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema ({
    email: {
        type: String,
        required: true,
    }
})

module.exports = Contact = mongoose.model('lead', LeadSchema) 