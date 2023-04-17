// const onesignal = require('api')('@onesignal/v9.0#e8ds50l6axnfm1');
const User = require('../models/user');
const request = require('request');
require('dotenv').config();
const API_KEY = process.env.ONESIGNAL_API_KEY;
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const BASE_URL = "https://onesignal.com/api/v1";

/**
 * OPTIONS BUILDER
 * @param {string} method
 * @param {string} path
 * @param {object} body
 * @returns {object} options
 */
const optionsBuilder = (method, path, body) => {
    return {
        method,
        'url': `${BASE_URL}/${path}`,
        'headers': {
            'Content-Type': 'application/json',   
            'Authorization': `Basic ${API_KEY}`,
        },
        body: body ? JSON.stringify(body) : null,
    };
}

/**
 * CREATE A PUSH NOTIFICATION
 * method: POST
 * Postman: https://www.postman.com/onesignaldevs/workspace/onesignal-api/request/16845437-c4f3498f-fd80-4304-a6c1-a3234b923f2c
 * API Reference: https://documentation.onesignal.com/reference#create-notification
 * path: /notifications
 * @param {object} body
 */

const createNotication = (body) => {
    const options = optionsBuilder("POST","notifications", body);
    console.log(options);
    request(options, (error, response) => {
        if (error) throw new Error(error);
        console.log(response.body);
        // viewNotifcation(JSON.parse(response.body).id);
    });
}
// @route POST
// @description Send a notification for a chat message
// @access Private
exports.send_message = async (req, res, next) => {
  if(req.body.senderId == undefined || req.body.participant1 == undefined || req.body.participant2 == undefined){
    res.status(400).json({ error: 'Invalid Request'});
  } else{
    console.log("TRANSFERING MESSAGE")
    let senderId = req.body.senderId
    let part1 = req.body.participant1
    let part2 = req.body.participant2
    let recipient

    if(senderId == part1){
      recipient = part2
    } else{
      recipient = part1
    }
    console.log(recipient)
    await User.findById(senderId).then(async sender =>{
      await User.findById(recipient).then(user =>{

        const body = {
          app_id: ONESIGNAL_APP_ID,
          include_player_ids: [user.oneSignalUserId,sender.oneSignalUserId],
          contents: {
            en: 'New message from ' + sender.firstName,
          },
          ios_badgeType: "Increase",
          ios_badgeCount: 1,
          data:{
            type: "message"
          }
          
          };
        console.log("DEBUG", body)
        createNotication(body);
        console.log("TRANSFERING MESSAGE RETURN")
        res.json({status: "Notification Successfully Sent"})

      }).catch(Exception=>
        res.status(404).json({ error: 'No such uuser' })
      )
    }).catch(Exception=>
      res.status(404).json({ error: 'No such uuser' })
    )
  }
}; 
  

