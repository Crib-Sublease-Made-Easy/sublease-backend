const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema ({
    email: {
        type: String,
        required: true,
    }
})

module.exports = Lead = mongoose.model('lead', LeadSchema) 