const Lead = require('../models/lead');
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const client = require('twilio')("ACe94558aef30193e8601dff1ab409c400", authToken);





//************************* LEADS CONTROLLER ***************************//


// @route POST /leads
// @description post leads
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

// @route POST /leads
// @description post leads
// @access Public
exports.ios_leads = (req, res, next) => {
  if(req.body.number == undefined){
    res.status(400).json({ error: 'Unable to send contact', errRaw: err });
  } else{
    client.messages
    .create({
        body: 'With Crib, sublease your apartment in just 30 seconds! Download the mobile app to get notified right away when others are interested in your sublease! https://apps.apple.com/us/app/crib-subleasing-made-easy/id1645127110',
        from: '+18775226376',
        to: `+1${req.body.number}`
    })
    .then(async (cont) => {
      res.status(200).json({ msg: 'Email Stored Successfully' })
    })
    .done()
    .catch(err => res.status(400).json({ error: 'Unable to store email', errRaw: err }));
  }
};


// @route GET /leads
// @description get leads
// @access Public
exports.get_leads = (req, res, next) => {

  Lead.find()
  .then(leads => {
      res.json(
          {
              count: leads.length,    
              leads
          })
      }
  )
  .catch(err => res.status(404).json({ leadsFound: 'none' }));
  
};

