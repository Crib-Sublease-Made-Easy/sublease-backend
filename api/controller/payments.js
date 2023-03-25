const fetch = require('node-fetch');
const jwt = require("jsonwebtoken");
const { query } = require('express');

var sq_access_token = process.env.SQUARE_ACCESS_TOKEN;





//************************* PAYMENTS CONTROLLER ***************************//

var data = {
	"quick_pay":{
		"name": "Crib Premium",
		"price_money": {
			"amount": 100,
			"currency": "USD"
		},
		"location_id": "LGZXV3FXE9F2J"

	}
}

// @route POST /payments/premium/generatelink
// @description generate payment link
// @access Private
// exports.prem_generate_link = (req, res, next) => {
//     console.log("FUCK")
//     fetch("https://connect.squareup.com/v2/online-checkout/payment-links", {
//         method: "POST",
//         headers: {
//             'Content-Type': 'application/json',
//             'Square-Version': '2023-03-15',
//             'Authorization': 'Bearer ' + sq_access_token
//         }, 
//         body: JSON.stringify(data)
//       }).then(resp => resp.json())
//       .then(json => res.json(json))
//       .catch(err => res.status(400).json({ error: 'unable to make request', errRaw: err }));
// };


exports.prem_generate_link = async(req, res, next) => {
    console.log("HELLLOOOOOOOOOO")
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    await fetch("https://connect.squareup.com/v2/online-checkout/payment-links", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Square-Version': '2023-03-15',
            'Authorization': 'Bearer ' + sq_access_token
        }, 
        body: JSON.stringify(data)
      }).then(resp => resp.json())
      .then(square_res => {
        //   console.log("THE SQUARE RESPONSE", square_res)
        const userId = decoded.userId;
        console.log(userId);
        if (userId == req.body.userId) {
            
            let query = {};
            let cribPremium = {};
            // console.log(square_res.related_resources.orders[0].state)
            if (req.body.referralCode != undefined) {
                query.referralCode = req.body.referralCode;
                console.log(square_res.related_resources.orders[0].state);
                let paymentDetails = {};
                if(square_res.related_resources.orders[0].state == "OPEN"){
                    paymentDetails.status = true
                }
                else{
                    paymentDetails.status = false
                }
                if(square_res.payment_link != undefined){
                    paymentDetails.orderId = square_res.payment_link.order_id;
                    paymentDetails.paymentLink = square_res.payment_link.url;
                    paymentDetails.paymentLinkCreatedAt= square_res.payment_link.created_at;
                    paymentDetails.paymentLinkId = square_res.payment_link.id;
                }
                
                cribPremium.paymentDetails = paymentDetails;
                cribPremium.referred = [];
                
            }
            query.cribPremium = cribPremium;

            console.log("Update user")

            User.findByIdAndUpdate(userId, query)
            // .then((user) => res.json(user))
            .catch((err) =>
                res.status(400).json({ error: "Unable to update the Database" })
            );
        }
        else{
            return res.status(400).json({
                message: "Incomplete info",
            });
        }
        return square_res
        }
      )
      .then(json => res.status(200).json(json))
      .catch(err => res.status(400).json({ error: 'unable to make request', errRaw: err }));
};


// let squareDetail = await resp.json();
        
//         const userId = decoded.userId;
//         console.log(userId)
//         if (userId == req.body.userId) {
//             query = {};
//             console.log("SQUAREEEEEE " ,squareDetail)
//             if (req.body.referralCode != undefined) {
//                 query.cribPremium.referralCode = req.body.referralCode;
//             }
            
//             if(squareDetail != undefined){
//                 query.cribPremium.details.paymentLink = squareDetail.payment_link.url;
//                 query.cribPremium.orderId = squareDetail.payment_link.order_id;
//                 query.cribPremium.paymentLinkCreatedAt = squareDetail.payment_link.created_at;
//                 query.cribPremium.paymentLinkId = squareDetail.payment_link.id;
//             }
            

//             else{
//                 return res.status(400).json({
//                     message: "Incomplete info",
//                 });
//             }
//             console.log("FINISHHHHH THE QUERY", query)
//             User.findByIdAndUpdate(req.params.id, query)
//                 .then((user) => res.json(user))
//                 .catch((err) =>
//                     res.status(400).json({ error: "Unable to update the Database" })
//                 );
//         } else {
//             return res.status(401).json({
//                 message: "Auth failed",
//             });
//         }