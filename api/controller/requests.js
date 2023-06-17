const Request = require('../models/request');
const Property = require('../models/property');
const User = require('../models/user');
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');
const fetch = require('node-fetch');

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
        accepted: false,
        timeAccepted: null,
        paid: false,
        tenantSignedContract: false,
        subtenantSignedContract: false
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



// @route PUT /request/addEnvelope
// @description PUT This is called from AWS Lambda function after contract gets generated -> takes in request_id and envelope_id in body
// @access private
exports.add_envelope = (req, res, next) => {
  Request.findOneAndUpdate({_id: req.body.requestId}, {envelopeId: req.body.envelopeId})
    .then(r => {
        res.status(200).json({data: "Request updated"})
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
                'localField': 'subtenantId', 
                'foreignField': '_id', 
                'as': 'subtenantInfo'
                }
            }, 
            {
                '$lookup': {
                'from': 'propertytests', 
                'localField': 'propId', 
                'foreignField': '_id', 
                'as': 'propInfo'
                }
            },
            {
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


// @route POST /request/requestesignature
// @description Called when tenant accepts booking - sends contract to both parties
// @access private
exports.request_esignature = (req, res, next) => {
    fetch('https://0ksxv2pwd7.execute-api.us-east-2.amazonaws.com/Prod', {
        method: 'POST',
        headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        "subleasor_name": req.body.subleasor_name,
        "subtenant_name": req.body.subtenant_name,
        "property_address": req.body.property_address,
        "sublease_start_date": req.body.sublease_start_date,
        "sublease_end_date": req.body.sublease_end_date,
        "rent": req.body.rent,
        "security_deposit": req.body.security_deposit,
        "request_id": req.body.request_id,
        "fee_percentage": "5",
    })
    }).then(async e => {
        res.status(200).json(e)
    })
    .catch( e => {
    console.log("Error in sending contract", e)
    })
};

// @route GET /request/contract/signedStatus
// @description Called when tenant accepts booking - sends contract to both parties
// @access private
const DOCUSIGN_ACCESS_TOKEN="eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAUABwAAZvdsoW7bSAgAAKYae-Ru20gCAE7zpH6mUhpAlmjmH_Zyx-MVAAEAAAAYAAEAAAAFAAAADQAkAAAAYzhmOWZiNDMtYTZlMi00NjEzLThlM2ItNjQyYjMxNzk1ZjliIgAkAAAAYzhmOWZiNDMtYTZlMi00NjEzLThlM2ItNjQyYjMxNzk1ZjliMACAd8nUDm3bSDcAPcuq3dd7SUuSy9LlC6ZCrQ.zy40Q5Wmi7x-XMCA5X5xajJWbb3jWmydzxJYk0cnUZjNo6emAxYGr06k9fpLTrgk9WXD9MPgXONVKUgvMmzbk_gJLKzhMgwChtjZhOm634ULtXcbsOZBjjbBOVqMWn8Qt_Us3hhakL2DOgIE-4AuXpcQ5ys_y2Ix-ldJObY2yF_XgXYSLNwOI_y9vc2ASf6bj3LXHpRb5R5FbyVcIh6TEN2-st1BD6mviYMYoiP_W4ukXh08Bgup3py3JamiGKYOsbsdg1SD6mqcCGIXDEKXfd085VMKMBRwIvJo8e9xRWq62PGILaODknYKWThyWmpAZI2K3J18m8uqqceOnKx42g"
const DOCUSIGN_ACCOUNT_ID="1b01896b-b609-4d8c-8d10-1900339b57f6"
exports.signed_status = (req, res, next) => {
    console.log("bruh")
    fetch('https://demo.docusign.net/restapi/v2.1/accounts/'+DOCUSIGN_ACCOUNT_ID+'/envelopes/'+req.params.envelope_id+'/recipients', {
        method: 'GET',
        headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+DOCUSIGN_ACCESS_TOKEN
    }
    }).then(res => res.json()).then(async e => {
        res.status(200).json(
            {
            recipient1: 
                {
                    name: e.signers[0].name,
                    email:e.signers[0].email,
                    status:e.signers[0].status
                },
            recipient2: 
                {
                    name: e.signers[1].name,
                    email:e.signers[1].email,
                    status:e.signers[1].status
                }
            })
    })
    .catch( e => {
    console.log("Error in sending contract", e)
    })
};