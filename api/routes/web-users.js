const express = require("express");
const router = express.Router();
const multer = require("multer");
const WebUserController = require("../controller/web-users");
const checkAuth = require("../middleware/check-auth");

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
router.post("/users/check", WebUserController.web_check_user);
router.post("/users/authy", WebUserController.web_authy);
router.post("/users/login", WebUserController.web_login_token);
router.get("/users/:id", checkAuth, WebUserController.web_user_get_one);
router.put("/users/:id", checkAuth, WebUserController.web_user_modify);
router.delete("/users/:id", checkAuth, WebUserController.web_user_delete);
router.put(
    "/users/profileImages/:id",
    upload.single("userImage"),
    checkAuth,
    WebUserController.web_user_modify_profilePic
);
router.get("/users/profileImages/:filename", WebUserController.web_get_image);
router.get("/users/favorites/all", checkAuth, WebUserController.web_user_get_favorites);

// OTP Code
router.post("/users/OTP/step1", WebUserController.web_otp_step1);
router.post("/users/OTP/step2", WebUserController.web_otp_step2);
router.post("/users/OTP/step3", upload.single("userImage"), WebUserController.web_otp_step3);

module.exports = router;
