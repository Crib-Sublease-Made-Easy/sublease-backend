const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const authy = require("authy")(process.env.AUTHY_ID);
// Load Properies Model
const User = require("../models/user");

const sendBirdAppId = process.env.SENDBIRD_APP_ID;
const oneSignalAppId = process.env.ONESIGNAL_APP_ID;

// ------------ Image Specific Code----------
const Grid = require("gridfs-stream");

const dbInstance = mongoose.connection;

let gfs, gridfsBucket;

dbInstance.once("open", () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(dbInstance.db, {
        bucketName: "profileImages",
    });

    gfs = Grid(dbInstance.db, mongoose.mongo);
    gfs.collection("profileImages");
});

//-----------Get an Image----------------
exports.get_image = async (req, res, next) => {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    if (file != null) {
        const readstream = gridfsBucket.openDownloadStream(file._id);
        // var readstream = gfs.createReadStream({ filename: req.params.filename });
        readstream.on("error", function (err) {
            res.send("No image found with that title");
        });
        readstream.pipe(res);
    }
};

//************************* WEB-USER CONTROLLER ***************************//

// @route POST /users/authy
// @description verifies user exists using phone number during login and returns their authy_id
// @access public
exports.web_authy = (req, res, next) => {
    User.find({ phoneNumber: req.body.phoneNumber })
        .exec()
        .then((user) => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Authentication Failed",
                });
            } else {
                return res.status(200).json({
                    authy_id: user[0].authy_id,
                });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
};

// @route POST /users/login
// @description login a web-user in the database and return access token
// @access public
exports.web_login_token = (req, resp, next) => {
    authy.verify(
        req.body.authy_id,
        (token = String(req.body.token)),
        function (err, res) {
            if (res != undefined) {
                if (String(res.success) == String(true)) {
                    User.find({ phoneNumber: req.body.phoneNumber })
                        .exec()
                        .then(async (user) => {
                            if (user.length < 1) {
                                return resp.status(401).json({
                                    message: "Authentication Failed",
                                });
                            } else {
                                const accessToken = jwt.sign(
                                    {
                                        phoneNumber: user[0].phoneNumber,
                                        userId: user[0]._id,
                                        token: "access",
                                    },
                                    process.env.JWT_KEY,
                                    {
                                        expiresIn: "1h",
                                    }
                                );
                                const refreshToken = jwt.sign(
                                    {
                                        phoneNumber: user[0].phoneNumber,
                                        userId: user[0]._id,
                                        email: user[0].email,
                                        firstName: user[0].firstName,
                                        lastName: user[0].lastName,
                                        token: "refresh",
                                    },
                                    process.env.JWT_KEY,
                                    {
                                        expiresIn: "100d",
                                    }
                                );

                                await User.findByIdAndUpdate(user[0]._id, {
                                    oneSignalUserId:
                                        req.body.oneSignalUserId,
                                });
                                return resp.status(200).json({
                                    message: "User successfully logged in",
                                    loggedIn: {
                                        firstName: user[0].firstName,
                                        lastName: user[0].lastName,
                                        profilePic: user[0].profilePic,
                                        phoneNumber: user[0].phoneNumber,
                                        school: user[0].school,
                                        occupation: user[0].occupation,
                                        _id: user[0]._id,
                                    },
                                    token: {
                                        accessToken: accessToken,
                                        refreshToken: refreshToken,
                                        sendBirdId: sendBirdAppId,
                                        oneSignalId: oneSignalAppId,
                                    },
                                });
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            resp.status(500).json({
                                error: err,
                            });
                        });
                }
            } else {
                resp.status(400).json({
                    error: err,
                    success: false,
                });
            }
        }
    );
};

// @route POST /users/check
// @description check if there is an existing user with the same phone number during signup
// @access public
exports.web_check_user = (req, res, next) => {
    console.log(req.body);
    User.find({ phoneNumber: req.body.phoneNumber })
        .exec()
        .then((user) => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message:
                        "User already has an account with this phone number",
                });
            } else {
                return res.status(200).json({
                    message: "This is a valid phone number",
                });
            }
        });
};

// @route POST /users/OTP/step1
// @description creates authy_id for user with email & phone number during signup
// @access public
exports.web_otp_step1 = (req, resp, next) => {
    if (req.body.email == undefined || req.body.phoneNumber == undefined) {
        resp.status(400).json({
            message: "Email and Phone Number must be provided",
        });
    } else {
        authy.register_user(
            req.body.email,
            req.body.phoneNumber,
            function (err, res) {
                console.log(err);
                console.log(res);
                if (res != undefined) {
                    if (String(res.success) === String(true)) {
                        resp.status(201).json({
                            response: res,
                        });
                    } else {
                        resp.status(401).json({
                            message: "Incorrect OTP",
                            response: res,
                        });
                    }
                } else {
                    resp.status(400).json({
                        error: err,
                        success: false,
                    });
                }
            }
        );
    }
};

// @route POST /users/OTP/step2
// @description sends SMS token to phone number associated with authy_id (login & signup)
// @access public
exports.web_otp_step2 = (req, resp, next) => {
    authy.request_sms(
        req.body.authy_id,
        (force = true),
        function (err, res) {
            console.log(err);
            if (res != undefined) {
                if (String(res.success) === String("true")) {
                    resp.status(201).json({
                        messge: "SMS token was sent",
                        response: res,
                    });
                } else {
                    resp.status(401).json({
                        message: "Failed to send OTP SMS",
                        response: res,
                    });
                }
            } else {
                resp.status(400).json({
                    error: err,
                    success: false,
                });
            }
        }
    );
};

// @route POST /users/OTP/step3
// @description verify user provided SMS token is correct during signup & creates a new Crib user in database
// @access public
exports.web_otp_step3 = (req, resp, next) => {
    authy.verify(
        req.body.authy_id,
        (token = String(req.body.token)),
        function (err, res) {
            console.log(err);
            let _id = new mongoose.Types.ObjectId();
            if (res != undefined) {
                if (String(res.success) == String(true)) {
                    const accessToken = jwt.sign(
                        {
                            phoneNumber: req.body.phoneNumber,
                            userId: _id,
                            token: "access",
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h",
                        }
                    );
                    const refreshToken = jwt.sign(
                        {
                            phoneNumber: req.body.phoneNumber,
                            userId: _id,
                            email: req.body.email,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            token: "refresh",
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "100d",
                        }
                    );

                    const user = new User({
                        _id: _id,
                        email: req.body.email,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        phoneNumber: req.body.phoneNumber,
                        oneSignalUserId: null,
                        dob: req.body.dob,
                        gender: req.body.gender,
                        authy_id: req.body.authy_id,
                        profilePic:
                            "https://crib-llc.herokuapp.com/users/profileImages/" +
                            req.file.filename,
                        postedProperties: [],
                        favoriteProperies: [],
                        occupation:
                            req.body.occupation == undefined
                                ? null
                                : req.body.occupation,
                        school:
                            req.body.school == undefined
                                ? null
                                : req.body.school,
                        deleted: false,
                    });

                    user.save()
                        .then((result) => {
                            console.log(result);
                            resp.status(201).json({
                                message: "User account created successfully",
                                createdUser: {
                                    firstName: result.firstName,
                                    lastName: result.lastName,
                                    profilePic: result.profilePic,
                                    phoneNumber: result.phoneNumber,
                                    occupation: result.occupation,
                                    school: result.school,
                                    _id: result._id,
                                },
                                token: {
                                    accessToken: accessToken,
                                    refreshToken: refreshToken,
                                    sendBirdId: null,
                                    oneSignalId: null,
                                },
                            });
                        })
                        .catch((err) => {
                            console.log(err);
                            resp.status(500).json({
                                error: err,
                            });
                        });
                } else {
                    resp.status(400).json({
                        error: err,
                        success: false,
                    });
                }
            } else {
            }
        }
    );
};