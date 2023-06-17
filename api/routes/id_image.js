const express = require("express");
const router = express.Router();
const IDImageController = require('../controller/id_image');
const checkAuth = require('../middleware/check-auth');

//---------------Image Specific Code--------------------------
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
const crypto = require("crypto");
const { GridFsStorage } = require("multer-gridfs-storage");

const dbInstance = mongoose.connection;
mongoose.Promise = global.Promise;

const storage = new GridFsStorage({
    //url: mongoDB,
    db: dbInstance,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(32, (err, buff) => {
                if (err) return reject(err);
                const filename =
                    buff.toString("hex") + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: "id_image",
                };
                resolve(fileInfo);
            });
        });
    },
});

const upload = multer({ storage });

//--------------------------------------------


router.post(
    "/",
    upload.single("id_image"),
    checkAuth,
    IDImageController.create_id_image
);
router.get("/:filename", IDImageController.get_image);

module.exports = router; 