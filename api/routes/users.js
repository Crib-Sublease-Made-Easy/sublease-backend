const express = require("express");
const router = express.Router();
const multer = require("multer");
const UserController = require("../controller/users");
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

router.post("/check", UserController.check_user);
router.post("/authy", UserController.authy);
router.post("/login", UserController.login_token);
router.delete("/:id", checkAuth, UserController.user_delete);
router.put("/:id", checkAuth, UserController.user_modify);
router.put("/referral/storecode", checkAuth, UserController.store_code);
router.put("/referral/validate", checkAuth, UserController.validate_referral);
router.put(
    "/profileImages/:id",
    upload.single("userImage"),
    checkAuth,
    UserController.user_modify_profilePic
);
// router.get("/", UserController.user_get_all);
router.get("/:id", checkAuth, UserController.user_get_one);
router.get("/profileImages/:filename", UserController.get_image);
router.get("/favorites/all", checkAuth, UserController.user_get_favorites);
router.post("/enrollCribConnect", UserController.enroll_crib_connect)
router.post("/cribconnect/contactSubtenants", checkAuth, UserController.contact_subtenant)
router.get("/cribconnect/getall", UserController.cribconnect_user)
router.post("/lastTwoSubtenants", UserController.getLastTwo_subtenants)
router.post("/addContactedBy", UserController.add_contacted_by)
router.post("/addSubleaseRequestSent", UserController.add_sublease_request_sent)
// router.post("/getRequestsSent", UserController.get_requests_sent)



//OTP Code
router.post("/OTP/step1", UserController.otp_step1);
// router.post("/OTP/step1/test", UserController.otp_step1_test);

router.post("/OTP/step2", UserController.otp_step2);
// router.post("/OTP/step2/test", UserController.otp_step2_test);

router.post("/OTP/step3", upload.single("userImage"), UserController.otp_step3);
// router.post("/OTP/step3/test", upload.single("userImage"), UserController.otp_step3_test);


module.exports = router;
