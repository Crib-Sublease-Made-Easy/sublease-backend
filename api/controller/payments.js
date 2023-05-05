const fetch = require('node-fetch');
const jwt = require("jsonwebtoken");
const { query } = require('express');
const Property = require('../models/property');
const User = require("../models/user");



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
        if(data.order.state == "OPEN" && data.order.net_amount_due_money.amount == 0){
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
            price += 40
            data.loc = "Madison"
            data.locPrice = "40"
        }
        else if(city.indexOf("losangeles") == 0 || city.indexOf("la") == 0 ){
            	price += 40
        	data.loc = "Los Angeles"
        	data.locPrice = "40"
        }
        else if(city.indexOf("newyork") == 0 || city.indexOf("ny") == 0){
          	price += 50
        	data.loc = "New York"
        	data.locPrice = "50"
           
        }
        else if(city.indexOf("austin") == 0){
          
           
        }
        else if(city.indexOf("sanmarcos") == 0){
          	price += 40
        	data.loc = "San Marocs"
        	data.locPrice = "40"
        
        }
        else if(city.indexOf("berkeley") == 0 || city.indexOf("california") == 0){
          	price += 40
        	data.loc = "Berkeley"
        	data.locPrice = "40"
          
        }
        else if(city.indexOf("sanfrancisco") == 0 || city.indexOf("sf") == 0 ){
            	price += 40
        	data.loc = "San Francisco"
        	data.locPrice = "40"
            
        }
	else if(city.indexOf("seattle") == 0 || city.indexOf("wa") == 0 ){
            	price += 40
        	data.loc = "Seattle"
        	data.locPrice = "40"
            
        }
	else if(city.indexOf("chicago") == 0 || city.indexOf("il") == 0 ){
            	price += 40
        	data.loc = "Chicago"
        	data.locPrice = "40"
            
   	 }
	    
    else if(city.indexOf("sanjose") == 0 || city.indexOf("ca") == 0 ){
        price += 50
        data.loc = "CA"
        data.locPrice = "50"
    }
    else if(city.indexOf("boston") == 0 || city.indexOf("ma") == 0 ){
        price += 50
        data.loc = "Boston"
        data.locPrice = "50"
    }
	else if(city.indexOf("mn") == 0){
        price += 20
        data.loc = "Minnesota"
        data.locPrice = "20"
    }
    else{
        data.loc = p.loc.secondaryTxt
        data.locPrice = "30"
        price += 30
    }

        let curTime = new Date().getTime()
        let startTime = new Date(p.availableFrom).getTime()

        let diff = startTime - curTime;

        let diffDays = Math.floor((diff)/(1000*60*60*24))

        data.days = diffDays

        if(diffDays < 10){
            price += 50
            data.daysToBegin = "short"
            data.daysToBeginPrice = "50"

        }
	    
        else if(diffDays < 15){
            price += 30
            data.daysToBegin = "short"
            data.daysToBeginPrice = "30"

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

exports.prem_get_crib_connect_user_number = (req, res, next) => {
    let number = 100;
    User.find()
    .then( users => {
        users.forEach(user => {
            if(user.cribConnectEnrolled == true ){
                number++;
            }
        })
        res.status(200).json({data: number})
    })
    .catch( e=> {
        res.status(400).json({data: "Error"})
    })
}

exports.prem_crib_connect_total_saving = (req, res, next) => {
    let number = 100;
    User.find()
    .then( users => {
        users.forEach(user => {
            if(user.cribConnectEnrolled == true ){
                number++;
            }
        })
        res.status(200).json({saving: 1257*3*number})
    })
    .catch( e=> {
        res.status(400).json({data: "Error"})
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
