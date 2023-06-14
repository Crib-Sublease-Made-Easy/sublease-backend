const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema ({
    paymentLink: {
        type: Object,
        required: true,
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    propId:{
        type: mongoose.Types.ObjectId,
        required: true
    },
    amount:{
        total:{
            type: Number,
            required: true
        },
        securityDeposit: {
            type:Number,
            required: true
        },
        fee:{
            type: Number,
            required: true
        }
    }
})

module.exports = Payment = mongoose.model('payments', PaymentSchema) 