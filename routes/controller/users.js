const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// Load Properies Model
const User = require('../../models/user');




//************************* USER CONTROLLER ***************************//


// @route POST /users/signup
// @description signup a user in the database
// @access public
router.post("/signup", (req, res, next) => {
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
              phoneNumber: req.body.phoneNumber,
              age: req.body.age,
              gender: req.body.gender
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "User Sign Up Successful!"
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
});



// @route POST /users/login
// @description login a user in the database and return access token
// @access public
router.post("/login", (req, res, next) => {
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
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            },
            process.env.JWT_KEY,
            {
                expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: "Authentication Successful",
            accessToken: token
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
});






// @route GET /users
// @description lists all of the users in the market
// @access public
router.get('/' , (req, res) => {
    User.find()
        .then(proprties => res.json(proprties))
        .catch(err => res.status(404).json({ propertiesFound: 'none'}));
        
});


// @route GET /users/:id
// @description Get single user by id
// @access Public
router.get('/:id', (req, res) => {
    User.findById(req.params.id)
      .then(user => res.json(user))
      .catch(err => res.status(404).json({ usersFound: 'No User found' }));
  });
  
  // @route POST /users
  // @description post user
  // @access Public
  router.post('/', (req, res) => {
    User.create(req.body)
      .then(user => res.json({ msg: 'user added successfully' }))
      .catch(err => res.status(400).json({ error: 'Unable to add this user', errRaw: err }));
  });
  
  // @route PUT /users/:id
  // @description Update user
  // @access Public
  router.put('/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, req.body)
      .then(user => res.json({ msg: 'Updated successfully' }))
      .catch(err =>
        res.status(400).json({ error: 'Unable to update the Database' })
      );
  });
  
  // @route DELETE /users/:id
  // @description Delete user by id
  // @access Public
  router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id, req.body)
      .then(user => res.json({ mgs: 'User deleted successfully' }))
      .catch(err => res.status(404).json({ error: 'No such a user' }));
  });


module.exports = router;