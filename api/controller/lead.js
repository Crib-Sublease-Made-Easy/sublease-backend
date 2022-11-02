const Lead = require('../models/lead');
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');




//************************* PROPERTY CONTROLLER ***************************//


// @route POST /properties
// @description post property
// @access Public
exports.collect_leads = (req, res, next) => {
  if(req.body.email == undefined){
    res.status(400).json({ error: 'Unable to send contact', errRaw: err });
  } else{
    const lead = new Lead({
      email: req.body.email,
    });
    lead
      .save()
      .then(async (cont) => {
        res.json({ msg: 'Email Stored Successfully' })
      })
      .catch(err => res.status(400).json({ error: 'Unable to store email', errRaw: err }));
  }
};