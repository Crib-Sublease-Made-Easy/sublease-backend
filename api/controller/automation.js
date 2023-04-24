const mongoose = require("mongoose");

// Load Properties and Users Models
const User = require("../models/user");
const Property = require('../models/property');
const { response } = require("express");
const { json } = require("body-parser");
const user = require("../models/user");

const IGID = "17841457359703661";
const IGTOKEN = "EAAMoc0mnE3EBAM6oqriGt8P1yvBTpLMlZCVkeKFZCbzUAR57un6woEQZAlSK0SONwZBiqTKvy5mmJZC53ZC7xNK5EKWpEyB2Uh8rsxImA7nnHZBd6K5Cwu4YkJKeG57fQMMu4hmDBhUZBOcJdIVqABd3sqXR29CbsNlKGzQ5sudEnt0v5RWkixkT";


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
