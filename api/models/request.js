const mongoose = require('mongoose')

const RequestSchema = new mongoose.Schema (
    {
        tenantId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        subtenantId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        propId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        envelopeId: {
            type: String,
            required: false
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        numberOfOccupants: {
            type: Number,
            required: true
        },
        about:{
            type: String,
            required:true
        },
        createdAt:{
            type: Date,
            required: true
        },
        accepted: {
            type: Boolean,
            required: true,
            index: true
        },
        timeAccepted:{
            type:Date,
            required: false
        },
        paid: {
            type: Boolean,
            required: true
        },
        paymentId: {
            type: mongoose.Types.ObjectId,
            required: false
        },
        tenantSignedContract: {
            type: Boolean,
            required: true
        },
        subtenantSignedContract: {
            type: Boolean,
            required: true
        }
    }
)
//delete the request object after 48 hours if the tenant doesnt accept
RequestSchema.index({createdAt: 1},{expireAfterSeconds: 100000,partialFilterExpression : {accepted: false}});
// RequestSchema.index({acceptedAt: 1},{expireAfterSeconds: 1,partialFilterExpression : 
//     {
//         $and:
//             [
//                 {
//                     $or:
//                         [
//                             {pay: false}, 
//                             {tenantSignedContract:false}, 
//                             {tenantSignedContract:false}
//                         ]
//                 },
//                 {accepted: true}
//             ]
//     }
// });

module.exports = Request = mongoose.model('requests', RequestSchema)
