const Request = require('../models/request');
const Property = require('../models/property');
const User = require('../models/user');
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');

//************************* REQUESTS CONTROLLER ***************************//
// @route POST /request
// @description creates anew request object
// @access private
exports.requests_create = (req, res, next) => {
    //create a new request object
  const request = new Request({
        tenantId: req.body.tenantId,
        subtenantId: req.body.subtenantId,
        propId: req.body.propId,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        numberOfOccupants: req.body.numberOfOccupants,
        about: req.body.about,
        createdAt: new Date(),
        accepted: req.body.accepted,
        timeAccepted: req.body.timeAccepted,
        paid: req.body.paid,
        tenantSignedContract: req.body.tenantSignedContract,
        subtenantSignedContract: req.body.subtenantSignedContract
  })
  //save the request object to the database
  request.save()
    .then(r =>  
        {
            //add the request object to the 
            let toAdd = {
                "requestId": r._id,
                "createdAt": new Date()
            }
            User.findOneAndUpdate({"_id": req.body.subtenantId}, {$push: { "requestsSent" : toAdd}})
                .catch(err => res.status(404).json({ error: err }));

            res.status(200).json({data: "Request created", _id: r._id.toString()})
        }    
    
)
    .catch(err => res.status(404).json({ error: err }));

};

// @route PUT /request/accepted
// @description updates the requested accepted field to true once the tenant accepts the booking
// @access private
exports.requests_accepted = (req, res, next) => {
  Request.findByIdAndUpdate(req.body.requestId, {accepted: true})
    .then(r => {
        res.status(200).json({data: "Request marked as accepted", _id: r._id.toString()})
    })
    .catch(err => res.status(404).json({ error: err }));

};

// @route delete /request/:id
// @description Delete request - used when tenant declines the request for booking
// @access private
exports.request_delete = (req, res, next) => {
  Request.findOneAndDelete(req.params.id)
    .then(r => {
         User.updateMany({}, { $pull: {requestsSent:{requestId: r._id}}})
        .then(users => {
            console.log("Removed")
        })
        res.status(200).json({data: "Request deleted", _id: r._id.toString()})
    })
    .catch(err => res.status(404).json({ error: err }));
};

// @route get /request/myrequests
// @description Gets all of the user's requests
// @access private
exports.request_retrievemyrequests = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.userId
        Request.find({subtenantId: userId}). then(data => {
            var propids = data.map(function(x) { return x.propId } );
            console.log(propids)
            Property.find({
                '_id': { $in: propids}
            })
            .then(r => {
                
                res.status(200).json(r)
            })
            .catch( err => res.status(400).json({data: err}))
        })
        .catch( err => res.status(400).json({data: err}))
};

// @route get /request/myreceivedrequests
// @description Gets all of the user's received requests for the property they posted
// @access private
exports.request_retrievemyreceivedrequests = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.userId
        Request.aggregate(
            [
            {
                '$lookup': {
                'from': 'users', 
                'localField': 'tenantId', 
                'foreignField': '_id', 
                'as': 'subtenantInfo'
                }
            }, {
                '$match': {
                'tenantId': mongoose.Types.ObjectId(userId)
                }
            }
            ])
            .then(r => {
                
                res.status(200).json(r)
            })
            .catch( err => res.status(400).json({data: err}))
};