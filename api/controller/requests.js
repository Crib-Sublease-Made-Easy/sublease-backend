const Request = require('../models/request');
const Property = require('../models/property');
const User = require('../models/user');
const jwt = require('jsonwebtoken')

//************************* REQUESTS CONTROLLER ***************************//
// @route POST /request
// @description creates anew request object
// @access private
exports.requests_create = (req, res, next) => {
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
  request.save()
    .then(r =>  res.status(200).json({data: "Request created", _id: r._id.toString()})
)
    .catch(err => res.status(404).json({ error: err }));

};

// @route PUT /request
// @description updates the requested accepted field to true once the tenant accepts the booking
// @access public
exports.requests_accepted = (req, res, next) => {
  Request.findByIdAndUpdate(req.body.requestId, {accepted: true})
    .then(r => {
        res.status(200).json({data: "Request marked as accepted", _id: r._id.toString()})
    })
    .catch(err => res.status(404).json({ error: err }));

};