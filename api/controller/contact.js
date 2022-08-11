const Contact = require('../models/contact');
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');




//************************* PROPERTY CONTROLLER ***************************//


// @route POST /properties
// @description post property
// @access Public
exports.contact_us = (req, res, next) => {
  const contact = new Contact({
    title: req.body.title,
    email: req.body.email,
    description: req.body.description,
  });
  contact
    .save()
    .then(async (cont) => {
      res.json({ msg: 'Contact sent successfully' })
    })
    .catch(err => res.status(400).json({ error: 'Unable to send contact', errRaw: err }));
};