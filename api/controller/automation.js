
const mongoose = require("mongoose");
const fetch = require('node-fetch');

// Load Properties and Users Models
const User = require("../models/user");
const Property = require('../models/property');
const { response } = require("express");
const { json } = require("body-parser");
const user = require("../models/user");

const IGID = "17841457359703661";
const IGTOKEN = "EAAMoc0mnE3EBAM6oqriGt8P1yvBTpLMlZCVkeKFZCbzUAR57un6woEQZAlSK0SONwZBiqTKvy5mmJZC53ZC7xNK5EKWpEyB2Uh8rsxImA7nnHZBd6K5Cwu4YkJKeG57fQMMu4hmDBhUZBOcJdIVqABd3sqXR29CbsNlKGzQ5sudEnt0v5RWkixkT";

const TWILIO_ACC_SID = process.env.TWILIO_ACC_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN


exports.automate_instagram = (req, res, next) => {
    User.find({ phoneNumber: req.body.phoneNumber })
        .then(async (user) => {
            await Property.findById(user[0].postedProperties[0])
                .then(async (prop) => {
                    const images = prop.imgList;
                    imageContainerIds = [];

                    // Create container for each image
                    for (var i=0; i < images.length; i++) {
                        let containerId;
                        await fetch("https://graph.facebook.com/v16.0/" + IGID + 
                            "/media?is_carousel_item=true&image_url=" + images[i] + "&access_token=" + IGTOKEN, 
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        .then(resp => resp.json())
                        .then(resp => {
                            containerId = resp.id
                        })
                        .catch(err => {
                            res.status(500).json({message: "Unable to create image container", status: err})
                        });

                        imageContainerIds.push(containerId)
                    }
                    
                    // Create carousel container
                    children = imageContainerIds.join('%2C')
                    start = prop.availableFrom.getMonth() + '%2F' + prop.availableFrom.getDate() + '%2F' + prop.availableFrom.getFullYear()
                    end = prop.availableTo.getMonth() + '%2F' + prop.availableTo.getDate() + '%2F' + prop.availableTo.getFullYear()
                    description = "%24" + prop.price + "%20%2Fmo.%20" + start + "-" + end + "%20%7C%20" + "Property%20details%20on%20the%20Crib%20App!%20Contact%20608-515-8038%20if%20interested."
                    let carouselId;

                    await fetch("https://graph.facebook.com/v16.0/" + IGID + 
                        "/media?media_type=CAROUSEL&children=" + children + "&caption=" + description + "&access_token=" + IGTOKEN, 
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(resp => resp.json())
                    .then(resp => {
                        carouselId = resp.id
                    })
                    .catch(err => {
                        res.status(500).json({message: "Unable to create carousel container", status: err})
                    });
                    
                    // Create post on Instagram
                    let postId;
                    await fetch("https://graph.facebook.com/v16.0/" + IGID + 
                        "/media_publish?creation_id=" + carouselId + "&access_token=" + IGTOKEN,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(resp => resp.json())
                    .then(resp => {
                        postId = resp.id
                    })
                    .catch(err => {
                        res.status(500).json({message: "Unable to post to Instagram", status: err})
                    });
                    
                    res.status(200).json({status: "Success", posted: postId});

                }).catch((err) => {
                    console.log(err);
                    res.status(404).json({
                        error: err
                    });
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(404).json({
                error: err
            });
        });
}

//*** Dangerous code ***
//Messaged all people about Google form
//Send google form link to people who are looking for a sublease
exports.automate_google_form = (req, res, next) => {
  
    User.find({type: "Looking for a sublease"})
    .then(async user=> {
        user.forEach((userData) =>{
           
            fetch('https://crib-llc.herokuapp.com/web/lookingforsublease', {
                method: 'POST',
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    number: userData.phoneNumber,
                    name: userData.firstName
                })
            }).then(async e => {})
            .catch( e => {
                console.log("Error in sending message")
            })
        
        })
    })
    User.find({type: "Both"})
    .then(async user=> {
        user.forEach((userData) =>{
            fetch('https://crib-llc.herokuapp.com/web/lookingforsublease', {
                method: 'POST',
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    number: userData.phoneNumber,
                    name: userData.firstName
                })
            }).then(async e => {})
            .catch( e => {
                console.log("Error in sending message")
            })    
        })
    })
    res.status(200).json({data: "success"})
}


//Remind people to use Crib Conenect

exports.automate_crib_connect_reminder = (req, res, next) => {
    let counter = 0;
    User.find()
    .then( users => {
        users.forEach(user =>{
           
            if(user.postedProperties.length != 0 && (user.cribPremium.paymentDetails.paymentLink == null || user.cribPremium.paymentDetails.paymentLink == undefined)){
                Property.findById(user.postedProperties[0])
                .then(p => {
                    let curTime = Number(new Date().getTime());
                    let startTime = Number(p.availableFrom);
                    let endTime = Number(p.availableTo);
                    const subleaseDays =  Math.floor((endTime - startTime)/(1000*60*60*24*30))
                    const days = Number(Math.floor(((startTime - curTime)/(1000*60*60*24))))

                    if(days > -30){
                        
                        // This is for checking
                        // if(user.phoneNumber == "6089991395"){
                            // console.log(user.firstName + "  " + `Estimated saving: ${subleaseDays*p.price} ` + `Days until start: ${days}`);
                            fetch('https://crib-llc.herokuapp.com/web/cribconnectreminder', {
                            method: 'POST',
                            headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                            number: user.phoneNumber,
                            days: days,
                            estimatedSavings:  subleaseDays*Number(p.price)
                            })
                            }).then(async e => {
                           
                            })
                            .catch( e => {
                            console.log("Error in sending message")
                            })
  
                        // }
                    }
                })
            }
        })
        console.log(counter)
       
        return res.status(200).json({data: "success"})
        
    })

//   User.findById(decoded.userId).then(user => {

//     fetch('https://crib-llc.herokuapp.com/web/cribconnectleads', {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       number: user.phoneNumber,
//       days: days,
//       estimatedSavings:  subleaseDays*Number(req.body.price)
//     })
//     }).then(async e => {
//       return res.status(200).json({data:e})
//     })
//     .catch( e => {
//       console.log("Error in sending message")
//     })
//   });



}


exports.automate_didnt_pay_crib_connect = (req, res, next) => {
    User.find()
    .then(users => {
        users.forEach((user)=>{
            if(user.cribPremium != undefined && user.referralCode != undefined){
                if(user.cribPremium.paymentDetails.status == false && user.referralCode != null){
                    console.log(user.firstName + " " + user.lastName);
                }
            }
        })
        res.status(200).json({data:"success"})
    })
    .catch(e => {
        res.status(400).json({data:"error"})
    })
}



/*---------IMPORTANT DO NOT TOUCH--------*/
exports.get_non_deleted_props = (req, res, next) => {
    User.aggregate(
        [
            {
              $match:
                /**
                 * query: The query in MQL.
                 */
                {
                  $or: [
                    {
                      "cribPremium.paymentDetails.status": true,
                    },
                    {
                      "cribPremium.paymentDetails.status": false,
                    },
                    {
                      "cribPremium.paymentDetails.status":
                        null,
                    },
                  ],
                },
            },
            {
              $project: {
                postedProperty: {
                  $toObjectId: {
                    $arrayElemAt: ["$postedProperties", 0],
                  },
                },
                firstName: "$firstName",
                lastName: "$lastName",
                gender: "$gender",
                occupation: "$occupation",
                email: "$email",
                phoneNumber: "$phoneNumber",
                cribConnect: "$cribPremium.paymentDetails",
              },
            },
            {
              $lookup:
                /**
                 * query: The query in MQL.
                 */
                {
                  from: "propertytests",
                  localField: "postedProperty",
                  foreignField: "_id",
                  as: "propertyDetails",
                },
            },
            {
              $project: {
                property: {
                  $arrayElemAt: ["$propertyDetails", 0],
                },
                firstName: "$firstName",
                lastName: "$lastName",
                gender: "$gender",
                occupation: "$occupation",
                email: "$email",
                phoneNumber: "$phoneNumber",
                cribConnect: {
                  $ifNull: ["$cribConnect.status", false],
                },
              },
            },
            {
              $match:
                /**
                 * query: The query in MQL.
                 */
                {
                  "property.deleted": false,
                },
            },
          ]
    )
    .then(tenants => {
        res.status(200).json({data: tenants})
    })
    .catch(e => {
        res.status(400).json({data: e})
    })
}


exports.tenant_automation = async (req, res, next) => {
    User.find({})
    .then(tenants => {
    })
    .then(async resp  => { 
        const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/1q7rRalCNEyJfe4greWFwLgL_QWFegPnE2BBrJOYJ4FI/values/Subtenants?key=AIzaSyBPp7WNpknXxGBxW9dne7C4kKym9UEptTY");
        const respo = await response.json();

        let subtenants = respo.values
        let countSubtenants = 0;
        subtenants.slice(1).forEach(async function(row) {
            //extract subtenant info
            const subName = row[0]
            const subAvailableFrom = row[1]
            let subAvailableTo = row[2]
            let subLocation = row[3]
            let subLat = row[4]
            let subLong = row[5]
            let subAge = row[6]
            let subRoommate = row[7]
            let subBudget = row[8]
            let subAbout = row[9]
            let subPhoneNumber = row[10]

            //extract tenant info
            const firstNameT = req.body.firstName
            const phoneNumberT = req.body.phoneNumber
            let availableFromT = req.body.availableFrom
            let availableToT = req.body.availableTo
            let latT = req.body.lat
            let longT = req.body.long

            var twilioUrl = 'https://api.twilio.com/2010-04-01/Accounts/' + TWILIO_ACC_SID + '/Messages.json';
            var authenticationString = TWILIO_ACC_SID + ':' + TWILIO_AUTH_TOKEN;

            // console.log("subF: ", subAvailableFrom)
            // console.log("tenF: ", availableFromT)
            // console.log("subT: ", subAvailableTo)
            // console.log("tenT: ", availableToT)
            // console.log("cond: ", new Date(subAvailableFrom) >= new Date(availableFromT) )
            // console.log("cond: ", new Date(subAvailableTo) <= new Date(availableToT))
            // console.log("cond: ", getDistInMiles(latT, longT, subLat, subLong))

            // console.log("-----------")



            if (new Date(subAvailableFrom) >= new Date(availableFromT) && new Date(subAvailableTo) <= new Date(availableToT) && getDistInMiles(latT, longT, subLat, subLong) <= 20) {
                console.log("Available From: " + new Date(availableFromT) + "        Available To: " + new Date(availableToT) + "     miles:   " + getDistInMiles(latT, longT, availableFromT, availableToT) + " connect: " + row.cribConnect);

                //Tenant is Not Crib Connect user
                countSubtenants++
    
            }
        });

        // try {
        //     console.log("SENDING")

        //     var details = {
        //         To: "+12624428111",
        //         Body: "[Crib] Hello "+firstNameT+", we have found you " + countSubtenants + " reliable and interested subtenant(s) 🛌. "+subName+" seems like a perfect match for your sublease. They are looking to stay from "+ new Date(subAvailableFrom).getMonth() +"/"+ new Date(subAvailableFrom).getDate()+ "/"+new Date(subAvailableFrom).getFullYear() +" to "+ new Date(subAvailableTo).getMonth() +"/"+ new Date(subAvailableTo).getDate()+ "/"+new Date(subAvailableTo).getFullYear() +". Get Crib connect to get in touch with them today!",
        //         From: '+18775226376', // Your Twilio phone number
        //     };
            
        //     var formBody = [];
        //     for (var property in details) {
        //       var encodedKey = encodeURIComponent(property);
        //       var encodedValue = encodeURIComponent(details[property]);
        //       formBody.push(encodedKey + "=" + encodedValue);
        //     }
        //     formBody = formBody.join("&");


        //     await fetch(twilioUrl, {
        //         method: 'POST',
        //         headers: {
        //             Accept: 'application/json',
        //             'Content-Type': 'application/x-www-form-urlencoded',
        //             Authorization: 'Basic ' + btoa(authenticationString)
        //         },
        //         body: formBody
        //     }).then(twilioResp =>{
        //         console.log('sent: ' + new Date())
        //         return twilioResp.json()
        //     }).then(ans => console.log(ans))
        //     return 'sent: ' + new Date();
        // } catch (err) {
        //     console.log('error: ' + err)
        //     return 'error: ' + err;
        // }

      return res.status(200).json({count: countSubtenants})
    })
    .catch( e => {
      console.log("Error in sending message", e)
    })
}



function getDistInMiles(lat1, lon1, lat2, lon2) {
    return _getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) * 0.621371;
}

function _getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in kilometers
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in KM
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}