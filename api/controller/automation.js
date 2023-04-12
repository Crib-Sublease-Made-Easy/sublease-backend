const mongoose = require("mongoose");

// Load Properties and Users Models
const User = require("../models/user");
const Property = require('../models/property');
const { response } = require("express");

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
                        body: {
                            "caption": description
                        },
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