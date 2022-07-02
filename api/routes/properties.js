const express = require("express");
const router = express.Router();

const PropertyController = require('../controller/properties');
const checkAuth = require('../middleware/check-auth');

//---------------Image Specific Code--------------------------
const multer = require('multer');

const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const {GridFsStorage} = require('multer-gridfs-storage');

const dbInstance = mongoose.connection;
const mongoURI = "mongodb+srv://vjanarthanan:6nXzPRAnaPfg3vxX@initialcluster.syvfxbn.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;

const storage = new GridFsStorage({
    //url: mongoDB,
    db: dbInstance,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(32, (err, buff) => {
                if (err) return reject(err);
                const filename = buff.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'propertyImages',
                };
                resolve(fileInfo);
            });
        });
    },
});

const upload = multer({ storage, limits: { fieldSize: 25 * 1024 * 1024 } });

//--------------------------------------------

const propertyPics = upload.fields([{ name: 'propImg1', maxCount: 1 }, { name: 'propImg2', maxCount: 1 }, { name: 'propImg3', maxCount: 1 }, { name: 'propImg4', maxCount: 1 }, { name: 'propImg5', maxCount: 1 }])

router.post("/",upload.array('propertyImages', 5), checkAuth,PropertyController.property_create);
router.get("/", PropertyController.property_get_all);
router.get("/pins", PropertyController.property_pins);
router.get("/query", PropertyController.property_query)
router.get("/:id", PropertyController.property_get_one);
router.put("/:id", checkAuth, PropertyController.property_modify);
router.get("/:id", checkAuth, PropertyController.property_delete);
router.get("/propertyImages/:filename", PropertyController.get_image);

module.exports = router;