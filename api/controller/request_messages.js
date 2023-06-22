const RequestMessages = require('../models/request_messages');
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const User = require("../models/user");
const fetch = require('node-fetch');




//************************* REQUEST MESSAGE CONTROLLER ***************************//


// @route POST /request_messages
// @description send a message to the request
// @access Private
exports.send_messages = (req, res, next) => {
    User.findOne({_id:  mongoose.Types.ObjectId(req.body.senderId)}).then(re=>{
        Request.findOne({_id:  mongoose.Types.ObjectId(req.body.requestId)}).then(rere=>{
            User.findOne({_id:  mongoose.Types.ObjectId((req.body.senderId == rere.tenantId) ? rere.subtenantId : rere.tenantId)}).then( reu=>{
                Property.findOne({_id:  mongoose.Types.ObjectId(rere.propId)}).then(async rep=>{

                    // console.log(re)
                //                         // console.log(rere)
                const message = RequestMessages({
                    requestId: new mongoose.Types.ObjectId(req.body.requestId),
                    senderId: new mongoose.Types.ObjectId(req.body.senderId),
                    senderName: re.firstName,
                    timeStamp: new Date(),
                    message: req.body.message
                })

                console.log(rep)
                console.log(reu)
                console.log("BRIHH",rere)

                await fetch('https://crib-llc.herokuapp.com/requests/sendEmailMessageReceived', {
                    method: 'POST',
                    headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({
        "recipientEmail": reu.email,
        "senderName": re.firstName + " " + re.lastName,
        "recipientName": reu.firstName + " " + reu.lastName,
        "location": rep.loc.streetAddr + ", " + rep.loc.secondaryTxt
   })
                }).then(result=>{

                message.save().then(r=>{
                    res.status(200).json({result: "messsage successfully sent"})
                }).catch(err=>{

                    res.status(400).json({err: "something went wrong", err})
                })

                }).catch(err=>{
                                                                            console.log("errr", err)

                    res.status(400).json({err: "something went wrong", err})
                })

            }).catch(err=>{

                    res.status(400).json({err: "something went wrong", err})
                })
            }).catch(err=>{
                    res.status(400).json({err: "something went wrong", err})
                })
    }).catch(err=>{
                    res.status(400).json({err: "something went wrong", err})
                })
    }).catch(err=>{
                    res.status(400).json({err: "something went wrong", err})
                })

};



// @route POST /request_messages
// @description send a message to the request
// @access Private
exports.get_messages = (req, res, next) => {
    RequestMessages.find({requestId: req.params.request_id}).then(r=>{
        res.json(r)
    }).catch(err=>{
        res.status(400).json({err: "something went wrong", err})
    })
};