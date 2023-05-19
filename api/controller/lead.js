const Lead = require('../models/lead');
const Property = require('../models/property');
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const client = require('twilio')(process.env.TWILIO_ACC_SID, process.env.TWILIO_AUTH_TOKEN);






//************************* LEADS CONTROLLER ***************************//


// @route POST /web/leads
// @description post leads
// @access Publics
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

// @route POST /web/iosleads
// @description on the website when users type in a phone number, we send them a confirmation code
// @access Public
exports.ios_leads = (req, res, next) => {

  if(req.body.number == undefined){
    res.status(400).json({ error: 'Unable to send contactsss'});
  } else{
    client.messages
    .create({
        body: 'Sublease your apartment with Crib in just 30 seconds! Download the mobile app to get notified right away when others are interested in your sublease! Check it out: linktree.com/crib.subleasing',
        from: '+18775226376',
        to: `+1${req.body.number}`
    })
    .then(message => {
        console.log(message)
        return res.status(200).json({data:"message sent!"})
      }
      )
    // .then(async (cont) => {
    //   res.status(200).json({ msg: 'Email Stored Successfully' })
    // })
    // .catch(err => res.status(400).json({ error: 'Unable to store email', errRaw: err }));
  }
};

// exports.posting_a_sublease = (res, req, next) => {
//   console.log(req.body.name)
//   if(req.body.name == undefined || req.body.number == undefined){
//     res.status(400).json({ error: 'Unable to send contactsss'});
//   } else{
//     client.messages
//     .create({
//         body: `[Crib] Hello ${req.body.name}, \n \nThank you for signing up on Crib! We are 1 step away from subleasing your Crib. \n \nWe want to assist you in finding the best subleases possible. A lot of students are looking for subleases now, sublease you room and save thousands over the summer!`,
//         from: '+18775226376',
//         to: `+1${req.body.number}`
//     })
//     .then(message => {
//       console.log(message)
//       return res.status(200).json({data:"message sent!"})
//     })
//     .catch(err => res.status(400).json({ error: 'Unable to store email', errRaw: err }));
//   }
  
// }

exports.crib_connect_leads = (req, res, next) => {
  if(req.body.number == undefined || req.body.days == undefined || req.body.estimatedSavings == undefined){
    res.status(400).json({ error: 'Unable to send contactsss'});
  } else{
    client.messages
    .create({
        body: `[Crib] Trying to sublease your room?🛌 \n \nCheck out Crib Connect, we find interested and reliable subtenants to take over your sublease so you don't have to! \n \nYour sublease ${req.body.days == 0 ? "is starting now" : `starts in ${req.body.days} days`}. There are ${req.body.subtenants < 3 ? "subtenants": ""+req.body.subtenants+ " subtenants"} interested in your property. Don't risk paying $${req.body.estimatedSavings} for an empty room!`,
        from: '+18775226376',
        to: `+1${req.body.number}`
    })
    .then(message => {
      console.log(message)
      return res.status(200).json({data:"message sent!"})
    })
    .catch(err => res.status(400).json({ error: 'Unable to store email', errRaw: err }));
  }
};

// @route POST /web/cribConnectReminder
// @description remind users to get Crib Connect
// @access Public 

exports.crib_connect_reminder = (req, res, next) => {
  if(req.body.number == undefined || req.body.days == undefined || req.body.estimatedSavings == undefined){
    res.status(400).json({ error: 'Unable to send contactsss'});
  } else{
    client.messages
    .create({
        body: `[Crib] Still trying to sublease your room?🛌 \n \nCheck out Crib Connect, we find interested and reliable subtenants to take over your sublease so you don't have to! \n \nYour sublease ${req.body.days == 0 ? "is starting now" : `starts in ${req.body.days} days`}. Don't risk paying $${req.body.estimatedSavings} for an empty room!`,
        from: '+18775226376',
        to: `+1${req.body.number}`
    })
    .then(message => {
      console.log(message)
      return res.status(200).json({data:"message sent!"})
    })
    .catch(err => res.status(400).json({ error: 'Unable to store email', errRaw: err }));
  }
};


// @route POST /web/lookingforsublease
// @description user sign up as "Looking for a sublease"
// @access Public 
exports.looking_for_sublease = (req, res, next) => {
  if(req.body.name == undefined || req.body.number == undefined){
    res.status(400).json({ error: 'Unable to send contactsss'});
  } else{
    client.messages
    .create({
        body: `[Crib] Hello ${req.body.name}, \n \nThank you for signing up on Crib! We are 1 step away from finding you a Crib. \n \nWe want to assist you in finding the best subleases possible. Please fill out this Google form (https://forms.gle/JKFtePpZZAgfkw1D8) so we can understand your needs!`,
        from: '+18775226376',
        to: `+1${req.body.number}`
    })
    .then(message => {
      console.log(message)
      return res.status(200).json({data:"message sent!"})
    })
    .catch(err => res.status(400).json({ error: 'Unable to store email', errRaw: err }));
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

exports.phoneNumber_promo = (req, res, next) => {
  let arr = [3326991131,8149969211,6467092048,3472971279,9299778961,9299778961,6144043920,9174289423,6462869638,4849359168,6468525143,9176919195,6467533643,9177690577,2013591619,6464044585,9296182394,6265549516, 6089991395]
  // let arr = [6089991395]
  
      arr.forEach((number) => {
          client.messages
      .create({
          body: `hihi, 你好呀，我是Isaac 是University of Wisocnsin Madison 的一个学生，我们和哥大學生做了一个转租的平台，比微信和FB的好用非常多，叫做 "Crib - subleasing" 在 App Store 和 Google Play (linktree.com/crib.subleasing)，我们有上千个人在上面转租和找房子，在纽约也有几百个用户在找转租. 如果你想转租，30s就可以搞定。有什么问题都可以问我哦～整个过程都是免费的！请多多支持`,
          from: '+18775226376',
          to: `+1${number}`
      })
      .then(message => {
      console.log(message)
     
      })
      .catch(err => res.status(400).json({ error: 'Unable to store email', errRaw: err }));
      })

      return res.status(200).json({data:"message sent!"})
}

//************************* LEAD CONTROLLER ***************************//
// @route GET /lead/privacydetails
// @description get Crib Connect FAQ dynamically
// @access public
exports.privacy_details = (req, res, next) => {
  let faqArr = [];

  let FAQ1 = {"User Data" : `We collect personally identifiable information, such as your name, email address, phone number, gender, school and occupation, and other information you directly give us on our App. Any of the information that you provide us may be publicly displayed on our platform. \n \nWe automatically log usage data and client information, such as time visited, tokens used, pages you viewed, how long you spent on a page, access times, internet protocol address, actions your perform, and other information about your use of and actions on our platform.`}
  faqArr.push(FAQ1)
  let FAQ2 = {"In App Awareness" : `You can contribute to Crib in several different ways, including uploading photos, engaging in chats, posting properties, creating a public profile, and viewing other posted properties. We may store these contributions on our server and display them to other users. Note that if you include Personal Information in your profile, it can be used and viewed by other users of Crib. We are not responsible for the information you choose to include in your public profile. \n \nYou may not disclose to us the personal information of another person by directly creating an account for them or indirectly disclosing their information in some other way.`}
  faqArr.push(FAQ2)

  res.status(200).json(faqArr);
}

//************************* LEAD CONTROLLER ***************************//
// @route GET /lead/privacydetails
// @description get Crib Connect FAQ dynamically
// @access public
exports.termsofservices_details = (req, res, next) => {
  let faqArr = [];

  let FAQ1 = {"Our Values" : `Crib is a mobile application that is developed to assist in the process of subleases. We bridge the gap between people who are looking for subleases and people who are subleasing their apartment. Our vision is to provide an easy-to-use, centralized and friendly platform to achieve that goal.`}
  faqArr.push(FAQ1)
  let FAQ2 = {"Guidelines" : `Users are expected to interact mannerly and politely while using the application, violators will be subjected to further investigation and may result to account deletion if their behavior does not improve. \n \nAll contents posted by users will be subject to inspection by Crib developers. Any content that violates our vision guidelines will be terminated and users will be warned. If situation does not improve, the user’s account will be permanently deleted.`}
  faqArr.push(FAQ2)
  let FAQ3 = {"Liability" : `We are not liable for any loses or damages inflected to you while using the application. Please be aware of your actions and do not give out sensitive informations to other users. Our company maintain the right to change or amend  our terms and services as needed. \n \nCrib may make changes to their service or discontinue any part of the service at any time without notice. Crib makes no commitment to maintaining or updating any service.`}
  faqArr.push(FAQ3)

  res.status(200).json(faqArr);
}



