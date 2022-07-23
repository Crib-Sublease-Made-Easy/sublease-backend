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
        timePosted: {
            type: String,
            required: false
        },
        postedBy: {
            type: String,
            required: false
        },
        price: {
            type: Number,
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
        amenities: {
            type: [String],
            required: false
        },
        loc: {
            type: {
              type: String,
              enum: ['Point'],
              default: 'Point',
            },
            coordinates: {
              type: [Number],
              default: [0, 0],
            },
            streetAddr: {
                type: String,
                required: false,
            },
            secondaryTxt: {
                type: String,
                required: false,
            }
        },
        imgList: {
            type: Array,
            required: false
        },
        numberOfViews: {
            type: Number,
            required: false
        },
        deleted: {
            type: Boolean,
            required: false
        },
    
    })
    PropertySchema.index({ "loc": "2dsphere" });

module.exports = Property = mongoose.model('propertyTest', PropertySchema)