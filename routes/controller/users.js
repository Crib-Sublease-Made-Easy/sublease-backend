const express = require('express');
const router = express.Router();

// Load Properies Model
const User = require('../../models/user');




//************************* PROPERTY CONTROLLER ***************************//
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