const express = require("express");
const router = express.Router();
const multer = require('multer');
const UserController = require('../controller/users');
const checkAuth = require('../middleware/check-auth');


//---------------Image Specific Code--------------------------
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const {GridFsStorage} = require('multer-gridfs-storage');

const dbInstance = mongoose.connection;
const mongoURI = "mongodb+srv://vjanarthanan:6nXzPRAnaPfg3vxX@initialcluster.syvfxbn.mongodb.net/?retryWrites=true&w=majority";
// mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
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
                    bucketName: 'profileImages',
                };
                resolve(fileInfo);
            });
        });
    },
});

const upload = multer({ storage });

//--------------------------------------------


router.post("/check", UserController.check_user);
router.post("/authy", UserController.authy);
router.post("/login", UserController.login_token);
// router.delete("/:id", UserController.user_delete);
router.put("/:id", checkAuth, UserController.user_modify);
router.put("/profileImages/:id", upload.single('userImage'), checkAuth, UserController.user_modify_profilePic);
// router.get("/", UserController.user_get_all);
router.get("/:id",checkAuth, UserController.user_get_one);
router.get("/profileImages/:filename", UserController.get_image);
router.get("/favorites/all", checkAuth, UserController.user_get_favorites)


//OTP Code
router.post("/OTP/step1", UserController.otp_step1);
router.post("/OTP/step2", UserController.otp_step2);
router.post("/OTP/step3", upload.single('userImage'), UserController.otp_step3);

module.exports = router;