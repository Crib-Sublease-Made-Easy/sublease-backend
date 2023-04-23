const mongoose = require("mongoose");
// Load Properies Model
const Subtenant = require("../models/subtenants");


exports.create = (req, res, next) => {
    console.log("creating")
    if(req.body.name == undefined || req.body.subleaseStart == undefined || req.body.subleaseEnd == undefined || 
        req.body.budget == undefined || req.body.bio == undefined || req.body.phoneNumber == undefined || 
        req.body.age == undefined || req.body.gender == undefined || req.body.sharedRoomFlexibility == undefined
        || req.body.roommatesFlexibility == undefined ){
            return res.status(404).json({data:"Incomplete Info"})
    }

    const subtenant = new Subtenant({
        name: req.body.name,
        subleaseStart: req.body.subleaseStart,
        subleaseEnd: req.body.subleaseEnd,
        budget: req.body.budget,
        bio: req.body.bio,
        phoneNumber: req.body.phoneNumber,
        age: req.body.age,
        gender: req.body.gender,
        sharedRoomFlexibility: req.body.sharedRoomFlexibility,
        roommatesFlexibility: req.body.roommatesFlexibility,
        deleted: false,
        createdAt: new Date()
    })

    subtenant.save()
    .then((result) => {
        console.log(result);
        res.status(200).json({data: "Subtenant created"})
    })
    .catch((err) => {
        console.log(err);
        res.status(400).json({data: "Error in creating subtenant"})
    });
}

exports.get_one = (req, res, next) => {
    // console.log("getting")
    // if(req.params.subtenantId == undefined){
    //     return res.status(404).json({data:"missing info"})
    // }
    // else{
    //     Subtenant.findById(req.params.subtenantID)
    //     .then((subtenant) =>  {
    //         console.log(subtenant)
    //     })
    //     .catch(e =>{ return res.status(400).json({data:"Error in retrieving"})})
    // }
    Subtenant.find({_id: req.body.subtenantId})
    .then((data) => res.status(200).json(data))
    .catch(e => { res.status(400).json({data: "Error"})})
}