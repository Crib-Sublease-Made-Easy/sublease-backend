const mongoose = require('mongoose');

const  ID_Image_Schema= new mongoose.Schema ({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    dateUploaded: {
        type: Date,
        required: true,
    },
    img_url: {
        type: String,
        required: true
    }
})

module.exports = ID_Image = mongoose.model('id_image', ID_Image_Schema) 