const fetch = require('node-fetch');
const jwt = require("jsonwebtoken");
const { query } = require('express');
const Property = require('../models/property');
const User = require("../models/user");
const Request = require('../models/request');
const Payment = require('../models/payment');
var differenceInDays = require('date-fns/differenceInDays')



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
    // if (userId != req.body.userId) {
    //     return res.status(400).json({message: "Auth failed"})
    // }

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
        if(data.order.state == "OPEN" && data.order.net_amount_due_money.amount < 100){
            User.findByIdAndUpdate(req.body.userId, {$set: {'cribPremium.paymentDetails.status': true}})
            .catch((err) =>
                res.status(400).json({ error: "Unable to update the Database" })
            );   
            console.log("POSTING TO FACEBOOK")

            //Post Crib Connect property to Facebook
            var at = "EAAHuzJqHCDcBAIdLv3215a22rg8eDfHif2N4jhyFXIW15UV4VJJUX3SfHgjZAAhKsjoPKeX4dY4gg8rcowifWwqg5rknIhiMMtbwXId26fZCSc8JsZBB2y6Vv5AoAC55KvpEoHBW0ZBjxB7GeV8JsOkAGPDR50eMo4K1zI4thThGdjq9yONk"
            let fb_img_ids = []
            User.findById(req.body.userId).then(async  u=> {
                    console.log("FOUND USER")

                    Property.findById(u.postedProperties[0]).then(async p => {
                        console.log("FOUND PROPERTY")

                        for(let i=0; i < p.imgList.length; i++){
                            url = "https://graph.facebook.com/v16.0/418408305947254/photos?url="+p.imgList[i]+"&published=false&access_token="+ at
                            await fetch(url, {method: "POST"}).then(async fbdata => fbdata.json()).then(fbdatajson => {
                                console.log(fbdatajson)
                                fb_img_ids.push(fbdatajson.id)
                            })
                        }
                        console.log("IDS: " + String(fb_img_ids)) 
                        let msg =  "Location: "+ String(p.loc.streetAddr)+", "+ String( p.loc.secondaryTxt) + "<center></center>"+"Availability: " + (new Date(p.availableFrom)).toDateString() + " - " +  (new Date(p.availableTo)).toDateString() + "<center></center>"+"Price: $"+ String(p.price)+ "<center></center>"+"Type:  " + String(p.type)+  "<center></center>"+"Rent is negotiable!+"+ "<center></center>"+"<center></center>" + String(p.description) + "<center></center>"+ "If you're interested, message me at: (608) 515-8038 with your name and this location. Thanks!"
                        let url_post= "https://graph.facebook.com/v16.0/418408305947254/feed?"
                        console.log("ADDING IMAGES")

                        for(let i=0; i<p.imgList.length; i++){
                            url_post = url_post + "attached_media["+String(i)+"]={'media_fbid':'"+String(fb_img_ids[i])+"'}&"

                        } 
                        url_post = url_post + "message="+msg+"&access_token="+at
                    console.log("PREFETCH")

                     fetch(url_post, {method: "POST"}).then(data=>data.json()).then(datajson=>  console.log(datajson))
                    console.log("POSTFETCH")

                        console.log(url_post)

                    })

            }).catch((err) =>
                res.status(400).json({ error: "Could not find user" })
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
            price += 200
            data.loc = "Madison"
            data.locPrice = "200"
        }
        else if(city.indexOf("losangeles") == 0 || city.indexOf("la") == 0 ){
            	price += 200
        	data.loc = "Los Angeles"
        	data.locPrice = "200"
        }
        else if(city.indexOf("newyork") == 0 || city.indexOf("ny") == 0){
            if(p.price > 3800){
                price += 550
        	    data.loc = "New York"
        	    data.locPrice = "550"
            }
            else if(p.price > 2000){
                price += 170
        	    data.loc = "New York"
        	    data.locPrice = "170"
            }
            else{
                price += 130
        	    data.loc = "New York"
        	    data.locPrice = "130"
            }
          	
           
        }
        else if(city.indexOf("newjersey") == 0 || city.indexOf("nj") == 0){
            if(p.price > 3800){
                price += 550
        	    data.loc = "New Jersey"
        	    data.locPrice = "550"
            }
            else if(p.price > 2000){
                price += 150
                data.loc = "New Jersey"
                data.locPrice = "150"
            }
            else{
                price += 120
        	    data.loc = "NJ"
        	    data.locPrice = "120"
	    } 
        }
        else if(city.indexOf("austin") == 0){
          price += 200
        	data.loc = "Austin"
        	data.locPrice = "200"
           
        }
        else if(city.indexOf("sanmarcos") == 0){
          	price += 200
        	data.loc = "San Marocs"
        	data.locPrice = "200"
        
        }
        else if(city.indexOf("berkeley") == 0 || city.indexOf("california") == 0){
          	price += 200
        	data.loc = "Berkeley"
        	data.locPrice = "200"
          
        }
        else if(city.indexOf("sanfrancisco") == 0 || city.indexOf("sf") == 0 ){
            	price += 200
        	data.loc = "San Francisco"
        	data.locPrice = "200"
            
        }
	else if(city.indexOf("seattle") == 0 || city.indexOf("wa") == 0 ){
            	price += 200
        	data.loc = "Seattle"
        	data.locPrice = "200"
            
        }
	else if(city.indexOf("chicago") == 0 || city.indexOf("il") == 0 ){
            	price += 200
        	data.loc = "Chicago"
        	data.locPrice = "200"
            
   	 }
	    
    else if(city.indexOf("sanjose") == 0 || city.indexOf("ca") == 0 ){
        price += 200
        data.loc = "CA"
        data.locPrice = "200"
    }
    else if(city.indexOf("boston") == 0 || city.indexOf("ma") == 0 ){
        price += 200
        data.loc = "Boston"
        data.locPrice = "200"
    }
	else if(city.indexOf("mn") == 0){
        price += 200
        data.loc = "Minnesota"
        data.locPrice = "200"
    }
    else{
        data.loc = p.loc.secondaryTxt
        data.locPrice = "180"
        price += 180
    }

        let curTime = new Date().getTime()
        let startTime = new Date(p.availableFrom).getTime()

        let diff = startTime - curTime;

        let diffDays = Math.floor((diff)/(1000*60*60*24))

        data.days = diffDays

        if(diffDays < 10){
            price += 150
            data.daysToBegin = "short"
            data.daysToBeginPrice = "150"

        }
	    
        else if(diffDays < 15){
            price += 70
            data.daysToBegin = "short"
            data.daysToBeginPrice = "70"

        }
        else if(diffDays < 30){
            price += 30
            data.daysToBegin = "medium"
            data.daysToBeginPrice = "30"
        }
        

        data.price = price
       if(req.body.propId == "6466ba559d00476001b4a276"){
           data.price="0.01"
       }
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

//************************* PAYMENT CONTROLLER ***************************//
// @route GET /premium/FAQ
// @description get Crib Connect FAQ dynamically
// @access public
exports.prem_FAQ = (req, res, next) => {
    let faqArr = [];

    let FAQ1 = {"🤷🏻‍♂️ What is Crib Connect?" : "Crib Connect is a service that finds interested and reliable tenants to take over your sublease for you! We only recommend the best tenants who fits your sublease deatils and description."}
    faqArr.push(FAQ1)
    let FAQ2 = {"🔎 How does Crib Connect work?" : `Crib Connect does all the work for you! Simply pay a one-time-fee which is determined by your sublease location and duration. Once payment is successful, you will be able to access information about potential tenants such as gender, name and phone number, as well as the sublease duration they need and their budget. Sublease details cannot be changed once after Crib Connect is paid. Please contact us in the contact us tab under settings page if there are any urgent changes. \n \nThe list of potential tenants updates everyday as we receive more sublease requests. Therefore, you are able to access all future potential tenants once you used Crib Connect.`}
    faqArr.push(FAQ2)
    let FAQ3 = {"🎉 I got Crib Connect!": `Congratulations! You’re one step away from subleasing you room. On average, Crib Connect users find an interested and reliable tenant in around 3 days! Be sure to check the list of potential tenants and see who fits your sublease the best. Our list also updates everyday so you got options!`}
    faqArr.push(FAQ3)
    let FAQ4 = {"💸 How does refund work?": "If we aren't able to find a suitable tenant for you or save more than what you've paid for Crib Connect. No worries! We will issue a refund right away. Crib Connect users can request a refund on the contact us page under settings. If you decide not to sublease anymore. We are able to refund 50% of your Crib Connect fee. We understand things happen!"}
    faqArr.push(FAQ4)
    let FAQ5 = {"😃 About us": "We are a student startup. Both founders experienced how difficult it is to find an affordable, short-term sublease so we want to make it easier for everyone. For Crib, we prioritize 2 things, security and how quick we can help users sublease their apartment. So far, we've connected over 1000+ users and made subleasing easier for everyone! For Crib, this is just the start!"}
    faqArr.push(FAQ5)

    res.status(200).json(faqArr);
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



//************************* PAYMENT CONTROLLER ***************************//
// @route POST /payment/generate
// @description Creates a payment link. Price will be Security deposity + Fee
// @access private

exports.gen_link = async(req, res, next) => {
    // const token = req.headers.authorization.split(" ")[1];
    // const decoded = jwt.verify(token, process.env.JWT_KEY);
    // const userId = decoded.userId
    const userId = req.body.userId
    console.log("GENERATING PAYMENT LINK")
    //Calculating Price: Security Deposit + ((Monthly Rent * Number of Months) * 0.05)
    //TO DO: Implement the rest

    let price = 0
    let fee = 0
    let securityDeposit = 0
    Property.findById(req.body.propId).then(async data=>{
        if(userId != data.postedBy){
            res.status(400).json({ error: "Unable to get payment link" })
        }
        price += data.securityDeposit;
        price += Math.abs(((data.price) * (differenceInDays( new Date(req.body.startDate), new Date(req.body.endDate))/30.437)) * 0.05)
        console.log(price)

        securityDeposit = data.securityDeposit;
        fee = Math.abs(((data.price) * (differenceInDays( new Date(req.body.startDate), new Date(req.body.endDate))/30.437)) * 0.05)
        console.log("SEC DEP", Number(Math.floor(securityDeposit)) * 100)
        console.log("FEE", Number(Math.floor(fee)) * 100)

         await fetch("https://connect.squareup.com/v2/online-checkout/payment-links", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Square-Version': '2023-03-15',
            'Authorization': 'Bearer ' + sq_access_token
        }, 
        body: JSON.stringify({    "checkout_options": {
                        "redirect_url": "https://crib-llc.herokuapp.com/payments/redirect_url&id="+userId
                        },
                                     "description": "Sublease with real people, let's save rent together! \n Sublease booking for " + (new Date(data.availableFrom).toDateString()) + " to " + (new Date(data.availableTo).toDateString()) + " at " + data.loc.streetAddr + + " " + data.loc.secondaryTxt,
             "order": {

      "line_items": [
        {
          "base_price_money": {
            "amount": Number(Math.floor(securityDeposit)) * 100,
            "currency": "USD"
          },
          "name": "Security Deposit",
          "quantity": "1"
        },
        {
          "quantity": "1",
          "base_price_money": {
            "amount": Number(Math.floor(fee)) * 100,
            "currency": "USD"
          },
          "name": "Fee (5% of Total Rent)"
        }
      ],
                      "location_id": "LGZXV3FXE9F2J"

    }
        })
      }).then(resp => resp.json())
      .then(square_res => {
          console.log("THE SQUARE RESPONSE", square_res)
            if(square_res.payment_link != undefined){
                const pay = new Payment({
                    paymentLink: square_res.payment_link,
                    userId: userId,
                    propId: data._id,
                    amount:{
                        total: Math.floor(fee + securityDeposit),
                        fee: Math.floor(fee),
                        securityDeposit: Math.floor(securityDeposit)
                    }
                })
                pay.save().then(r =>{
                    console.log(r)
                    console.log("bruhhhh")
                    Request.findOneAndUpdate({_id:req.body.requestId}, {paymentId: r._id}).then( result => {
                        console.log("HEHHHHHH")
                        res.status(200).json({data: "Payment link successfully generated"})
                    })      .catch(err => res.status(400).json({ error: 'update request id catch', errRaw: err }));

                })
            }

            })

      .catch(err => res.status(400).json({ error: 'unable to make request', errRaw: err }));



    }) .catch(err => res.status(400).json({ error: 'unable to make request', errRaw: err }));



   };

function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}

// @route GET /payments/redirect_url/:id
// @description mark the request as paid and redirect them to 
// @access public
exports.redirect_url = (req, res, next) => {

    // console.log("RUNNING")

    Request.findOneAndUpdate({subtenantId: req.query.id}, {paid: true}).then( result => {
        res.writeHead(301, { Location: `https://www.crib-app.com/`}).end()
    }).catch(e=>res.status(404))  

}
                    
