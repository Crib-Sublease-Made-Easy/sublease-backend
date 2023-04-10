const Lead = require('../models/lead');
const Property = require('../models/property');
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const client = require('twilio')(process.env.TWILIO_ACC_SID, process.env.TWILIO_AUTH_TOKEN);





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

// @route POST /iosleads
// @description on the website when users type in a phone number, we send them a confirmation code
// @access Public
exports.ios_leads = (req, res, next) => {
  if(req.body.number == undefined){
    res.status(400).json({ error: 'Unable to send contactsss'});
  } else{
    client.messages
    .create({
        body: 'Sublease your apartment with Crib in just 30 seconds! Download the mobile app to get notified right away when others are interested in your sublease! Download it here: linktree.com/crib.subleasing',
        from: '+18775226376',
        to: `+1${req.body.number}`
    })
    .then(message => console.log(message))
    // .then(async (cont) => {
    //   res.status(200).json({ msg: 'Email Stored Successfully' })
    // })
    // .catch(err => res.status(400).json({ error: 'Unable to store email', errRaw: err }));
  }
};

// @route POST /androidleads
// @description on the website when users type in a phone number, we send them a confirmation code
// @access Public
exports.android_leads = (req, res, next) => {
  if(req.body.number == undefined){
    res.status(400).json({ error: 'Unable to send contactsss'});
  } else{
    client.messages
    .create({
        body: 'With Crib, sublease your apartment in just 30 seconds! Download the mobile app to get notified right away when others are interested in your sublease! https://play.google.com/store/apps/details?id=com.Crib.SubleasingMadeEasy&hl=en_US&gl=US',
        from: '+18775226376',
        to: `+1${req.body.number}`
    })
    .then(message => console.log(message))
    // .then(async (cont) => {
    //   res.status(200).json({ msg: 'Email Stored Successfully' })
    // })
    // .catch(err => res.status(400).json({ error: 'Unable to store email', errRaw: err }));
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

// //route POST /generateFacebookPost
// // @description given property detail, generate a FB post
// // @access Private

// exports.gen_fb_post = (req, res, next) => {
//   const token = req.headers.authorization.split(" ")[1];
//   const decoded = jwt.verify(token, process.env.JWT_KEY);
//   const userId = decoded.userId;
//   if(userId == req.body.userId){
//     Property.findOne({_id: req.body.propId})
//     .then(prop =>{
//       let respond = {}
//       console.log(prop)
//       res.status(200).json({ error: "ok" })
//     })
//   }
//   else{
//     return res.status(401).json({
//       message: "Auth failed",
//     });
//   }

// }

