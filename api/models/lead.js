const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema ({
    email: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Number,
        retuired: false
    }
})

module.exports = Lead = mongoose.model('lead', LeadSchema) 