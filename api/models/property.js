const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema (
    {
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
        },
        availableFrom: {
            type: String,
            required: false
        },
        availableTo: {
            type: String,
            required: false
        },
        furnished: {
            type: Boolean,
            required: false
        },
        moveinFlexibility: {
            type: Boolean,
            required: false
        },
        renew: {
            type: Boolean,
            required: false
        },
        pets: {
            type: Boolean,
            required: false
        },
        parking: {
            type: Boolean,
            required: false
        },
        onSiteWasherDryer: {
            type: Boolean,
            required: false
        },
        description: {
            type: String,
            required: false
        },
        bed: {
            type: Number,
            required: false
        },
        bath: {
            type: Number,
            required: false
        },
        sharedRoom: {
            type: Boolean,
            required: false
        },
        utilitiesIncluded: {
            type: Boolean,
            required: false
        },
        imgList: {
            type: Array,
            required: false
        },
        numberOfViews: {
            type: Array,
            required: false
        },
        deleted: {
            type: Boolean,
            required: false
        },
    
    })

module.exports = Property = mongoose.model('property', PropertySchema)