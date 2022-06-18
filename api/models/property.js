const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema ({
    title: {
        type: String,
        required: false
    },
    type: {
        type: String,
        required: false,
    },
    location: {
        type: String,
        required: false
    },
    timePosted: {
        type: String,
        required: false
    },
    postedBy: {
        type: String,
        required: false
    },
    price: {
        type: mongoose.Decimal128,
        required: false
    }
})

module.exports = Property = mongoose.model('property', PropertySchema)