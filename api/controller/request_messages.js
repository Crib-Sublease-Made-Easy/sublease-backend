const RequestMessages = require('../models/request_messages');
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');




//************************* PROPERTY CONTROLLER ***************************//


// @route POST /request_messages
// @description send a message to the request
// @access Private
exports.send_messages = (req, res, next) => {
    const message = new RequestMessages({
        requestId: new mongoose.Types.ObjectId(req.body.requestId),
        senderId: new mongoose.Types.ObjectId(req.body.senderId),
        senderName: req.body.senderName,
        timeStamp: new Date(),
        message: req.body.message
    })
    message.save().then(r=>{
        res.status(200).json({result: "messsage successfully sent"})
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