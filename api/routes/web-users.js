const express = require("express");
const router = express.Router();
const multer = require("multer");
const WebUserController = require("../controller/web-users");

//---------------Image Specific Code--------------------------
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
                    bucketName: "profileImages",
                };
                resolve(fileInfo);
            });
        });
    },
});

const upload = multer({ storage });

//--------------------------------------------
router.post("/web-users/authy", WebUserController.web_authy);
router.post("/web-users/login", WebUserController.web_login_token);

module.exports = router;
