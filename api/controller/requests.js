const Request = require('../models/request');
const Property = require('../models/property');
const User = require('../models/user');
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');
const fetch = require('node-fetch');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

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
        accepted: true,
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
            }, {
                '$lookup': {
                    'from': 'propertytests', 
                    'localField': 'propId', 
                    'foreignField': '_id', 
                    'as': 'propInfo'
                }
            }, {
                '$match': {
                    'tenantId': userId
                }
            }
        ])
            .then(r => {
                
                res.status(200).json(r)
            })
            .catch( err => res.status(400).json({data: err}))
}
// @route POST /request/requestesignature
// @description Called when tenant accepts booking - sends contract to both parties
// @access private
exports.request_esignature = (req, res, next) => {
      Request.findByIdAndUpdate(req.body.requestId, {accepted: true, timeAccepted: new Date()})
    .then(r => {

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
        res.status(200).json({data: "Request marked as accepted and contracts sent"})
    })
    .catch( e => {
    console.log("Error in sending contract", e)
    })
        })    .catch( e => {
    console.log("Error in marking request as accepted", e)
    })
};

// @route GET /request/contract/signedStatus
// @description Called when tenant accepts booking - sends contract to both parties
// @access private
const DOCUSIGN_ACCESS_TOKEN="eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAUABwAA8g4uLW_bSAgAADIyPHBv20gCAE7zpH6mUhpAlmjmH_Zyx-MVAAEAAAAYAAEAAAAFAAAADQAkAAAAYzhmOWZiNDMtYTZlMi00NjEzLThlM2ItNjQyYjMxNzk1ZjliIgAkAAAAYzhmOWZiNDMtYTZlMi00NjEzLThlM2ItNjQyYjMxNzk1ZjliMACAd8nUDm3bSDcAPcuq3dd7SUuSy9LlC6ZCrQ.jcBGEvjT9NlJQgWPDlhwRbhCZeF-LPtw4TACSY46LoUVwVqno0wMFCvSCb0TvIcPpiArNIXB-eWqjuctyTjm6gcBe70X_exwLHDTQtqwBBK0nxphkJL4wtI67ciNhd7Cd4BXF1aGEMjfh0ghpjA1JJw4_bL0An-K5V_x3bFihdI95-paJ6LdOvFX8s_VdljkNpzbC_v4PI2tmwh5HYpmsamLy_u2ipmnw-vhvNGSzVKYmYBm5rhSkgNzaxiktmWYMxQgdU1hqTEHGCsTa9T9pIl1LyOC9XHFRyaoCx2UxApgKVwD9bcSQg38Dodcg-JInrmm7Pl7BR82ljyVAOBUpQ"
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


//route POST /requests/sendEmailNotification
//description use email to send notificaiton 
exports.send_email_notification = (req,res,next) => {
    console.log("testing")
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(SENDGRID_API_KEY)
    const msg = {
    to: 'hlee777@wisc.edu', // Change to your recipient
    from: 'cribappllc@gmail.com', // Change to your verified sender
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }
    sgMail
    .send(msg)
    .then((r) => {
        console.log('Email sent')
        res.status(200).json({data:'email sent'})
    })
    .catch((error) => {
        console.error(error)
    })
}