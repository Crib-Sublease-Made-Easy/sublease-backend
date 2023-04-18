const fetch = require('node-fetch');
const jwt = require("jsonwebtoken");
const { query } = require('express');
const Property = require('../models/property');


var sq_access_token = process.env.SQUARE_ACCESS_TOKEN;





//************************* PAYMENTS CONTROLLER ***************************//

var data = {
    "description": "Crib Connect immediately connects tenants with reliable and interested subtenants at a very small fee $9.99. With Crib Connect you will receive a list of 5 to 10 potential subtenants.",
	"quick_pay":{
		"name": "Crib Connect",
		"price_money": {
			"amount": 1999,
			"currency": "USD"
		},
		"location_id": "LGZXV3FXE9F2J"

	}
}


var testData = {
    "description": "Crib Connect immediately connects tenants with reliable and interested subtenants at a very small fee $9.99. With Crib Connect you will receive a list of 5 to 10 potential subtenants.",
	"quick_pay":{
		"name": "Crib Connect",
		"price_money": {
			"amount": 1999,
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
// }


exports.prem_generate_link = async(req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    let price = 1999;
    if(req.body.price != undefined && req.body.price != null){

        price = Math.floor(Number(req.body.price)*100)
        console.log(price)
    }
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    await fetch("https://connect.squareup.com/v2/online-checkout/payment-links", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Square-Version': '2023-03-15',
            'Authorization': 'Bearer ' + sq_access_token
        }, 
        body: JSON.stringify({
            "description": "Crib Connect immediately connects tenants with reliable and interested subtenants at a very small fee $9.99. With Crib Connect you will receive a list of 5 to 10 potential subtenants.",
            "quick_pay":{
                "name": "Crib Connect",
                "price_money": {
                    "amount": price,
                    "currency": "USD"
                },
                "location_id": "LGZXV3FXE9F2J"

            }
        })
      }).then(resp => resp.json())
      .then(square_res => {
          console.log("THE SQUARE RESPONSE", square_res)
        const userId = decoded.userId;
       
        if (userId == req.body.userId) {
            
            let query = {};
            let cribPremium = {};
            // console.log(square_res.related_resources.orders[0].state)
            if (req.body.referralCode != undefined) {
                query.referralCode = req.body.referralCode;
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
            console.log("fucl")
            query.cribPremium = cribPremium;

            console.log("Update user")

            User.findByIdAndUpdate(userId, query)
            // .then((user) => res.json(user))
            .catch((err) =>
                res.status(400).json({ error: "Unable to update the Database" })
            );
            return res.status(200).json(square_res)
        }
        else{
            return res.status(400).json({
                message: "Incomplete info",
            });
        }
        
        }
      )
      .catch(err => res.status(400).json({ error: 'unable to make request', errRaw: err }));
};

exports.prem_generate_testing_link = async(req, res, next) => {
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
        body: JSON.stringify(testData)
      }).then(resp => resp.json())
      .then(square_res => {
        //   console.log("THE SQUARE RESPONSE", square_res)
        const userId = decoded.userId;
        if (userId == req.body.userId) {
            
            let query = {};
            let cribPremium = {};
            // console.log(square_res.related_resources.orders[0].state)
            if (req.body.referralCode != undefined) {
                query.referralCode = req.body.referralCode;
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
            return res.status(200).json(square_res)
        }
        else{
            return res.status(400).json({
                message: "Incomplete info",
            });
        }
        
        }
      )
      .catch(err => res.status(400).json({ error: 'unable to make request', errRaw: err }));
};


//************************* PAYMENT CONTROLLER ***************************//
// @route GET /premium/status
// @description get the status of Crib premium, return either false meaning not premium or true 
// @access private

exports.prem_status = async(req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if(req.body.orderId == null || req.body.orderId == undefined){
        return res.status(401).json({message: "Incomplete data"})
    }

    const userId = decoded.userId;
    if (userId != req.body.userId) {
        return res.status(400).json({message: "Auth failed"})
    }

    await fetch("https://connect.squareup.com/v2/orders/" + req.body.orderId, {
    method: "GET",
    headers: {
        'Content-Type': 'application/json',
        'Square-Version': '2023-03-15',
        'Authorization': 'Bearer ' + sq_access_token
    }, 
    }).then(resp => resp.json())
    .then(data => {
        
       
        console.log(data)
        console.log(data.order.state)
        //The payment is paid
        if(data.order.state == "OPEN"){
            User.findByIdAndUpdate(req.body.userId, {$set: {'cribPremium.paymentDetails.status': true}})
            .catch((err) =>
                res.status(400).json({ error: "Unable to update the Database" })
            );   
        }
        

        return res.status(200).json(data)
    })
    .catch(err => res.status(400).json({ error: 'Unable to make request', errRaw: err }));
}

//************************* PAYMENT CONTROLLER ***************************//
// @route POST /premium/getprice
// @description get price depening on the sublease
// @access private
exports.prem_get_price = async(req, res, next) => {
    let price = 19.99;
    Property.findById(req.body.propId).then(async p => {
        let data = {}
        data.basePrice = price;

        //take out comma and change to lower case
        let city = p.loc.secondaryTxt.replaceAll(",","").replaceAll(" ","").toLowerCase();

        //Madison and cit
        if(city.indexOf("madison") == 0 ){
            price += Math.floor(p.price*0.05)
            data.loc = "Madison"
            data.locPrice = (Math.floor(p.price*0.05)).toString()
        }
        else if(city.indexOf("losangeles") == 0 || city.indexOf("la") == 0 ){
            
           
            
        }
        else if(city.indexOf("newyork") == 0 || city.indexOf("ny") == 0){
          
           
        }
        else if(city.indexOf("austin") == 0){
          
           
        }
        else if(city.indexOf("sanmarcos") == 0){
          
        
        }
        else if(city.indexOf("berkeley") == 0 || city.indexOf("california") == 0){
          
          
        }
        else if(city.indexOf("sanfrancisco") == 0 || city.indexOf("sf") == 0 ){
            
            
        }
	else if(city.indexOf("seattle") == 0 || city.indexOf("wa") == 0 ){
            
            
        }
	else if(city.indexOf("chicago") == 0 || city.indexOf("il") == 0 ){
            
            
    }
	    
    else if(city.indexOf("sanjose") == 0 || city.indexOf("ca") == 0 ){
        price += Math.floor(p.price*0.05)
        data.loc = "CA"
        data.locPrice = (Math.floor(p.price*0.05)).toString()        
    }
	else if(city.indexOf("mn") == 0){
        price += 20
        data.loc = "Minnesota"
        data.locPrice = "20"
    }
    else{
        data.loc = p.loc.secondaryTxt
        data.locPrice = (Math.floor(p.price*0.05)).toString()
        price += Math.floor(p.price*0.05)
    }

        let curTime = new Date().getTime()
        let startTime = new Date(p.availableFrom).getTime()

        let diff = startTime - curTime;

        let diffDays = Math.floor((diff)/(1000*60*60*24))

        data.days = diffDays

        if(diffDays < 15){
            price += 40
            data.daysToBegin = "short"
            data.daysToBeginPrice = "40"

        }
        else if(diffDays < 30){
            price += 20
            data.daysToBegin = "medium"
            data.daysToBeginPrice = "20"
        }
        

        data.price = price
       
        return res.status(200).json(data);
    })
    .catch(e => {
        return res.status(404).json({price: null})
    })

}




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
