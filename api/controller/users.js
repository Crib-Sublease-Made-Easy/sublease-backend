const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const authy = require('authy')('ih05cS5wQXVEj0hMZKg0u6EVgVX9TfzO');
// Load Properies Model
const User = require('../models/user');
const router = require('express').Router();
const config = require('config')
const db = config.get('mongoURI')

const sendBirdAppId = '14BD0602-4159-48D7-9292-66136C479B46';


// ------------ Image Specific Code----------
const Grid = require('gridfs-stream');

const dbInstance = mongoose.connection;

 let gfs, gridfsBucket;
 

 dbInstance.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(dbInstance.db, {
  bucketName: 'profileImages'
});

  gfs = Grid(dbInstance.db, mongoose.mongo);
  gfs.collection('profileImages');
})

//-----------Get an Image----------------
exports.get_image = async(req, res, next) => {
  const file = await gfs.files.findOne({ filename: req.params.filename });
  const readstream = gridfsBucket.openDownloadStream(file._id);
 // var readstream = gfs.createReadStream({ filename: req.params.filename });
  readstream.on("error", function (err) {
    res.send("No image found with that title");
  });
  readstream.pipe(res);
}


//************************* USER CONTROLLER ***************************//



// @route POST /users/OTP/step1
// @description create useraccount
// @access public
exports.otp_step1= (req, resp, next) => {
  authy.register_user(req.body.email, req.body.phoneNumber, function (err, res) {
    console.log(err)
    console.log(res)
    if(String(res.success) === String(true)){
      User.findOneAndUpdate({ email: req.body.email },{phoneNumber: req.body.phoneNumber})
      .exec()
      .then(user => {
        resp.status(201).json({
          id: res.user.id,
          response: res
        })
      });


    } else{
      resp.status(401).json({
        message: "Incorrect OTP",
        response: res
      })
    }

  });
};


// @route POST /users/OTP/step2
// @description send sms
// @access public
exports.otp_step2= (req, resp, next) => {

  authy.request_sms(req.body.authy_id, force=true, function (err, res) {
    console.log(err)
    if(String(res.success) === String("true")){
      resp.status(201).json({
        messge: "SMS token was sent",
        response: res
      })
    } else{
      resp.status(401).json({
        message: "Failed to send OTP SMS",
        response: res
      })
    }

  });
}


// @route POST /users/OTP/step3
// @description send sms
// @access public
exports.otp_step3= (req, resp, next) => {
  authy.verify(req.body.authy_id, token=String(req.body.token), function (err, res) {
    console.log(err)
    if(String(res.success) == String(true)){
      User.findOneAndUpdate({ email: req.body.email },{otpSuccessful: true})
    .exec()
    .then(user => {

      const accessToken = jwt.sign(
        {
          email: user.email,
          userId: user._id
        },
        process.env.JWT_KEY,
        {
            expiresIn: "1h"
        }
      );
      const refreshToken = jwt.sign(
        {
          email: user.email,
          userId: user._id
        },
        process.env.JWT_KEY,
        {
            expiresIn: "100d"
        }
      );

      resp.status(201).json({
        messge: "Success",
        token: {
          accessToken: accessToken,
          refreshToken: refreshToken
        }
      })
    });
    } else{
      resp.status(401).json({
        message: "Failed",
      })
    }

  });
}
  

// @route POST /users/signup
// @description signup a user in the database
// @access public
exports.user_signup = (req, res, next) => {
  console.log(req.body)
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "User already has an account with this email"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {


            const user = new User({
              //_id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              // phoneNumber: req.body.phoneNumber,
              dob: req.body.dob,
              gender: req.body.gender,
              authy_id: '',
              profilePic: 'https://sublease-app.herokuapp.com/users/profileImages/' + req.file.filename,
              postedProperties: [],
              favoriteProperies: [],
              occupation: (req.body.occupation == undefined) ? null : req.body.occupation,
              school: (req.body.school == undefined) ? null : req.body.school,
              otpSuccessful: false

            });
            user
            .save()
            .then(result => {


              console.log(result);
              res.status(201).json({
                message: "User signed up successfully",
                createdUser: {
                    firstName: result.firstName,
                    lastName: result.lastName,
                    profilePic: result.profilePic,
                    _id: result._id,
                }
              });
            })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
};



// @route POST /users/login
// @description login a user in the database and return access token
// @access public
exports.user_login = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Authentication Failed"
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Authentication Failed"
          });
        }
        if (result) {
          const accessToken = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            },
            process.env.JWT_KEY,
            {
                expiresIn: "1h"
            }
          );
          const refreshToken = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            },
            process.env.JWT_KEY,
            {
                expiresIn: "100d"
            }
          );
          return res.status(200).json({
            message: "Authentication Successful",
            token: {
              access: accessToken,
              refresh: refreshToken
            },
            sendbirdAppId: sendBirdAppId,
            loggedInUser:{
              firstName: user[0].firstName,
              lastName: user[0].lastName,
              profilePic: user[0].profilePic,
              _id: user[0]._id
            }
          });
        }
        res.status(401).json({
          message: "Authentication Failed"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};






// @route GET /users
// @description lists all of the users in the market
// @access public
exports.user_get_all= (req, res, next) => {
    User.find()
        .then(proprties => res.json(proprties))
        .catch(err => res.status(404).json({ propertiesFound: 'none'}));
        
};


// @route GET /users/:id
// @description Get single user by id
// @access Public
exports.user_get_one = (req, res, next) => {
    User.findById(req.params.id)
      .then(user => res.json(user))
      .catch(err => res.status(404).json({ usersFound: 'No User found' }));
  };
  
  // @route POST /users
  // @description post user
  // @access Public
  // router.post('/', (req, res) => {
  //   User.create(req.body)
  //     .then(user => res.json({ msg: 'user added successfully' }))
  //     .catch(err => res.status(400).json({ error: 'Unable to add this user', errRaw: err }));
  // });
  
  // @route PUT /users/:id
  // @description Update user
  // @access Public
  exports.user_modify = (req, res, next) => {
    User.findByIdAndUpdate(req.params.id, req.body)
      .then(user => res.json(user ))
      .catch(err =>
        res.status(400).json({ error: 'Unable to update the Database' })
      );
  };
  
  // @route DELETE /users/:id
  // @description Delete user by id
  // @access Public
  exports.user_delete = (req, res, next) => {
    User.findByIdAndRemove(req.params.id, req.body)
      .then(user => res.json({ mgs: 'User deleted successfully' }))
      .catch(err => res.status(404).json({ error: 'No such a user' }));
  };


