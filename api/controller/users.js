const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const authy = require("authy")(process.env.AUTHY_ID);
// Load Properies Model
const User = require("../models/user");
const Subtenant = require("../models/subtenants");

const Property = require('../models/property');


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

//************************* USER CONTROLLER ***************************//

// @route POST /users/OTP/step1
// @description Create an Authy account for the user and return Authy ID
// @access Public
exports.otp_step1 = (req, resp, next) => {
    if (req.body.email == undefined || req.body.phoneNumber == undefined) {
        resp.status(400).json({
            message: "Email and Phone Number must be provided",
        });
    } else {
        authy.register_user(
            req.body.email,
            req.body.phoneNumber,
            req.body.countryCode,
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
// @description Send Authy SMS token to user
// @access Public
exports.otp_step2 = (req, resp, next) => {
    //DEMO ACCOUNT
    if (req.body.authy_id == 999999999) {
        return resp.status(201).json({
            messge: "SMS token was sent",
        });
    } else {
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
    }
};

// @route POST /users/OTP/step3
// @description Verify Authy SMS token from user is correct
// @access Public
exports.otp_step3 = (req, resp, next) => {
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
                    let im;
                    if(req.file == null || req.file == undefined){
                        im = "b8f610273a81210bd236b9cdd2a5a8b9d62a8ad26660faafe8f6f5da6acbb063";
                    }
                    else{
                        im = req.file.filename;
                    }

                    const user = new User({
                        _id: _id,
                        email: req.body.email,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        phoneNumber: req.body.phoneNumber,
                        oneSignalUserId: req.body.oneSignalUserId,
                        dob: req.body.dob,
                        gender: req.body.gender,
                        authy_id: req.body.authy_id,
                        profilePic:
                            "https://crib-llc.herokuapp.com/users/profileImages/" +
                            im,
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
                        cribConnectSubtenants:[],
                        type: req.body.type == undefined
                            ? null
                            : req.body.type,
                        countryCode: req.body.countryCode
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
                                sendBirdId: sendBirdAppId,
                                oneSignalId: oneSignalAppId,
                            },
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        resp.status(500).json({
                            error: err,
                        });
                    });
                    
                    // if(req.body.type == "Looking for a sublease" || req.body.type == "Both"){
                    //     fetch('https://crib-llc.herokuapp.com/web/lookingforsublease', {
                    //     method: 'POST',
                    //     headers: {
                    //     Accept: 'application/json',
                    //     'Content-Type': 'application/json',
                    //     },
                    //     body: JSON.stringify({
                    //         number: req.body.phoneNumber,
                    //         name: req.body.firstName
                    //     })
                    //     }).then(async e => {
                    //     })
                    //     .catch( e => {
                    //     console.log("Error in sending message")
                    //     })
                    // }
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

// @route POST /users/check
// @description Check if a user exists with the same phone number
// @access Public
exports.check_user = (req, res, next) => {
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

// @route POST /users/authy
// @description Retrieve an existing user's Authy ID from database
// @access Public
exports.authy = (req, res, next) => {
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
// @description Login a user in the database and return access token
// @access public
exports.login_token = (req, resp, next) => {
    if (req.body.token == 999999 && req.body.authy_id == 999999999) {
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
                        oneSignalUserId: req.body.oneSignalUserId,
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
    } else {
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
    }
};

// @route GET /users/favorites/all
// @description Get a users favorite properties
// @access Public
exports.user_get_favorites = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.userId;
    User.aggregate([
        {
            $match: { _id: mongoose.Types.ObjectId(userId) },
        },
        {
            $lookup: {
                from: "propertytests",
                localField: "favoriteProperties",
                foreignField: "_id",
                as: "properties",
            },
        },
    ])
        .then(async (x) => {
            let propertiesArray = x[0].properties.filter(function (e) {
                return e.deleted == false;
            });
            let props = await Promise.all(
                propertiesArray.map(async (p) => {
                    if(p.postedBy == null){
                        let d = {};
                        let q = {};
                        q.propertyInfo = p;
                        q.userInfo = d;
                        return q;
                    }
                    else{
                        let d = await User.findById(p.postedBy).then(
                            async (user) => {
                                let q = p;
                                postedUser = {};
                                postedUser.firstName = user._id;
                                postedUser.firstName = user.firstName;
                                postedUser.lastName = user.lastName;
                                postedUser.profilePic = user.profilePic;
                                postedUser.occupation = user.occupation;
                                postedUser.school = user.school;
                                q.pos = postedUser;
                                console.log("P", q);
                                return postedUser;
                            }
                        );
                        let q = {};
                        q.propertyInfo = p;
                        q.userInfo = d;
                        return q;
                    }
                })
            );
            // console.log("END", props)
            res.json(props);
        })
        .catch((err) => {
            // console.log(err);
            res.status(500).json({
                error: err,
            });
        });
};

// @route GET /users/:id
// @description Get a single user by id
// @access Public
exports.user_get_one = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.userId;
    if (userId == req.params.id) {
        User.findById(req.params.id)
            .then((user) => res.json(user))
            .catch((err) =>
                res.status(404).json({ usersFound: "No User found" })
            );
    } else {
        return res.status(401).json({
            message: "Auth failed",
        });
    }
};

// @route PUT /users/:id
// @description Update a user's school, occupation, or email
// @access Public
exports.user_modify = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.userId;
    if (userId == req.params.id) {
        query = {};
        if (req.body.school != undefined) {
            query.school = req.body.school;
        }
        if (req.body.occupation != undefined) {
            query.occupation = req.body.occupation;
        }
        if (req.body.email != undefined) {
            query.email = req.body.email;
        }
        User.findByIdAndUpdate(req.params.id, query)
            .then((user) => res.json(user))
            .catch((err) =>
                res.status(400).json({ error: "Unable to update the Database" })
            );
    } else {
        return res.status(401).json({
            message: "Auth failed",
        });
    }
};

// @route PUT /users/profileImages/:id
// @description Update a user's profile pic
// @access Public
exports.user_modify_profilePic = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.userId;
    if (userId == req.params.id) {
        User.findByIdAndUpdate(req.params.id, {
            profilePic:
                "https://crib-llc.herokuapp.com/users/profileImages/" +
                req.file.filename,
        })
            .then((user) =>
                res.json({
                    msg: "profile pic successfully changed",
                    profilePic:
                        "https://crib-llc.herokuapp.com/users/profileImages/" +
                        req.file.filename,
                })
            )
            .catch((err) =>
                res.status(400).json({ error: "Unable to update the Database" })
            );
    } else {
        return res.status(401).json({
            message: "Auth failed",
        });
    }
};

// @route PUT users/referral/storecode
// @description Stores the referral code for a Crib Premium user
// @access Private
exports.store_code = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    console.log(JSON.stringify(req.files))
    User.findOneAndUpdate(
        { _id: decoded.userId },
        { $push: { cribPremium: {referralCode: req.body.generated_code} } },
    ).then(resp => {
        res.json({ msg: 'referral code stored' })
    }).catch(err => res.status(400).json({ error: 'Unable to store code', errRaw: err }));
};

// @route PUT users/referral/validate
// @description Validates referral code for a new Crib user
// @access Private
exports.validate_referral = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    User.findOne({referralCode: req.body.referralCode})
        .then(async (user) => {
            let decodedId = await decoded.userId
            if(decodedId == user._id){
                return res.status(401).json({error: "Can't refer self"});
            }
            await User.findByIdAndUpdate(decodedId, {
                referredBy: user._id
            }).catch((err) => res.status(404).json({error: "Referred user doesn't exist."}));
            res.status(200).json({ referredBy: user._id, message: "Referral recorded."})
        }).catch((err) => res.status(404).json({error: "Invalid referral code"}));
};


//************************* INACTIVE SERVICES ***************************//

// @route DELETE /users/:id
// @description Delete user by id
// @access Public
exports.user_delete = (req, res, next) => {
    User.findByIdAndRemove(req.params.id, req.body)
        .then((user) => res.json({ mgs: "User deleted successfully" }))
        .catch((err) => res.status(404).json({ error: "No such a user" }));
    
    authy.delete_user(req.body.authyID, function (err, res) {
        console.log(res.message);
        console.log("ERROR" , err);
    })
    return res;
  };

// @route GET /users
// @description lists all of the users in the market
// @access public
exports.user_get_all = (req, res, next) => {
    User.find()
        .then((proprties) => res.json(proprties))
        .catch((err) => res.status(404).json({ propertiesFound: "none" }));
};


// @route POST /enrollCribConnect
// @description enroll in Crib Connect but havent paid for Crib Connect
// @access public 

exports.enroll_crib_connect = (req, res, next) => {
    if(req.body.userId == undefined || req.body.userId == null){
        res.status(404).json({data: "Must specify id"})
        return
    }
    console.log(req.body.userId)
    User.findByIdAndUpdate(req.body.userId, {
        "cribConnectEnrolled": true
    })
    .then(prop => res.status(200).json({ msg: 'Updated successfully' }))
    .catch(err =>
        res.status(400).json({ error: 'Unable to update the Database' })
    );
    
}

// @route POST /contactSubtenants
// @description add phone number to the cribConnectSubtenantsContacted array
// @access public 

exports.contact_subtenant = (req, res, next) => {
   
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    console.log("Token", token)
    const userId = decoded.userId;
    if(req.body.userId == undefined || req.body.subtenantID == undefined){
        res.status(400).json({
            message: "userId or phone number undefined",
        });
    }
   
    else{

    
        if (userId == req.body.userId) {
            User.updateOne({ _id :req.body.userId}, 
            {$push: 
                {cribConnectSubtenantsContacted : req.body.subtenantID}},
            )
            .then(prop => res.status(200).json({ msg: 'Updated successfully' }))
            .catch(err =>
                res.status(400).json({ error: err })
            );

            //Add the id to the cribConnectSubtenantsContacted
        
            
        } else {
            return res.status(401).json({
                message: "Auth failed",
            });
        }
    }
}

// @route GET /cribconnectuser
// @description get the list of paid crib connect users
// @access public 

exports.cribconnect_user = (req, res, next) => {
    User.find({"cribPremium.paymentDetails.status" : true})
    .then( data => res.json(data))
    .catch( e => res.json({"Error" : e}))
}
// @route POST /lastTwoSubtenants
// @description get last two subtenants
// @access public

exports.getLastTwo_subtenants = (req,res,next) => {
    if(req.body.userId == null || req.body.userId == null == undefined){
        res.status(404).json({"Error": "Insufficient info"})
    }
    User.findOne({"_id": req.body.userId})
    .then( user => {
        let subArr = user.cribConnectSubtenants;

        if(subArr.length == 0 || subArr.length == 1){
            if(subArr.length == 0){
                res.json({data: []})
            }
            else{
                Subtenant.findOne({_id:user.cribConnectSubtenants[0]})
                .then( sub => res.status(200).json([sub]));
            }
        }
        else{
            let subArr = user.cribConnectSubtenants
           

            Subtenant.findOne({_id: subArr[subArr.length - 1]})
            .then( sub1 => {
                Subtenant.findOne({_id: subArr[subArr.length -2]})
                .then( sub2 => {
                    res.status(200).json({data: [sub1, sub2]})
                })
                .catch( e => {
                    res.status(400).json({data: []})
                })
            })
            .catch( e => {
                res.status(400).json({data: []})
            })
        }
    })
}

//@route /users/addContactedBy
//@description when people click show number on website, it gets documetned to the the user's contactedBy field

exports.add_contacted_by = (req,res,next) => {
    if(req.body.postedById == undefined || req.body.phoneNumber == undefined || req.body.name == undefined){
        res.status(404).json({data: "Incomplete info"})
    }
    else{
        User.findOneAndUpdate({"_id" :req.body.postedById}, {
            $push:{
                "contactedBy": {
                    name: req.body.name,
                    phoneNumber: req.body.phoneNumber
                }
            }
        })
        .then( r => res.status(200).json({data: "success"}))
        .catch( err => res.status(400).json({data: err}))
    }
}

//@route POST /addSubleaseRequestSent
//@description when subtenant fill out a form, mark it in the document, along with the prop Id that was sent to

exports.add_sublease_request_sent = (req,res,next) => {
    if(req.body.propId == undefined || req.body.userId == undefined){
        res.status(404).json({data: "Incomplete info"})
    }
    else{
        let toAdd = {
            "propId": req.body.propId,
            "createdAt": new Date()
        }
        User.findOneAndUpdate({"_id": req.body.userId}, {$push: { "requestsSent" : toAdd}})
        .then( r => res.status(200).json({data: "succecced"}))
        .catch( err => res.status(400).json({data: err}))
    }
}

//@router GET /getRequestsSent
//@description Get all the requests sent

exports.get_requests_sent = (req,res, next) => {
 
    if(req.body.userId == undefined){
        res.status(404).json({data: "Incomplete info"})
    }
    else{

        User.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(req.body.userId)} }, // any condition
            { "$unwind": "$requestsSent" },
            { "$group": { "_id": req.body.userId, "propIds": { $push: "$requestsSent.propId" } } }
        ]).then((data)=>{
            
            Property.find({
                '_id': { $in: data[0].propIds}
            })
            .then(r => {
                res.status(200).json(r)
            })
            .catch( err => res.status(400).json({data: err}))
        })
        .catch( err => res.status(400).json({data: err}))
    }
}