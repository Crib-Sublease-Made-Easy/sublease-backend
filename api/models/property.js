const mongoose = require('mongoose');
// const amens = new mongoose.Schema({ value: { type: String, enum: [
// 'Pet_Friendly',
// 'Garages',
// 'Swimming_Pool',
// 'Wifi',
// 'Gym',
// 'Washer_Dryer',
// 'Gated_Access',
// 'Public_Transportation',
// 'Heating_Cooling',
// 'Microwave',
// 'Grill',
// 'TV',
// 'Fridge' ,
// 'Couch',
// 'Mattress',
// 'Oven',
// 'Coffee_Maker',
// 'Toaster',
// 'Dishes',
// 'Pots_Pans',
// 'Utilities_Included',
// 'Walkin_Closet',
// 'Iron',
// 'Freezer',
// 'Street_Parking',
// 'Parking_on_Premesis',
// 'Balcony'
// ]} });

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
            type: Date,
            required: false
        },
        availableTo: {
            type: Date,
            required: false
        },
        description: {
            type: String,
            required: false
        },
        bed: {
            type: String,
            required: false
        },
        bath: {
            type: String,
            required: false
        },
        amenities: {
            type: [String],
            required: false
        },
        preference: {
            type: String,
            required: false,
            default: null
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
            required: true
        },
        securityDeposit: {
            type: Number,
            required: false
        },
        availabilityFlexibility: {
            type: Boolean,
            required: false
        },
    })
    PropertySchema.index({ "loc": "2dsphere" });


module.exports = Property = mongoose.model('propertytests', PropertySchema)
