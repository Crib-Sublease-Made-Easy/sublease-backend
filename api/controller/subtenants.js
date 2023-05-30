const mongoose = require("mongoose");
// Load Properies Model
const Subtenant = require("../models/subtenants");
const User = require("../models/user");
const client = require('twilio')(process.env.TWILIO_ACC_SID, process.env.TWILIO_AUTH_TOKEN);
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');


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


exports.create = (req, res, next) => {
    console.log("creating")
    if(req.body.name == undefined || req.body.subleaseStart == undefined || req.body.subleaseEnd == undefined || 
        req.body.budget == undefined || req.body.bio == undefined || req.body.phoneNumber == undefined || 
        req.body.age == undefined || req.body.gender == undefined || req.body.sharedRoomFlexibility == undefined
        || req.body.roommatesFlexibility == undefined || req.body.location == undefined || req.body.coords == undefined){
            return res.status(404).json({data:"Incomplete Info"})
    }

    

    let subtenant_objid = new mongoose.Types.ObjectId();

    const subtenant = new Subtenant({
        _id: subtenant_objid,
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
        location: req.body.location,
        coords: req.body.coords,
        deleted: false,
        type: req.body.type == undefined ?  'room' : req.body.type,
        desiredArea: req.body.desiredArea,
        createdAt: new Date()
    })

    subtenant.save()
    .then(async (result) => {
        console.log(result);
        await fetch("https://crib-llc.herokuapp.com/automation/nondeletedprops", {method:"GET"}).then(data => data.json()).then( async datajson => {
            for(let i=0; i< datajson.data.length;i++){
                console.log("--------")
                console.log(getDistInMiles(req.body.coords[0],  datajson.data[i].property.loc.coordinates[1], datajson.data[i].property.loc.coordinates[0],  req.body.coords[1]))
                console.log(req.body.coords[0] +" "+req.body.coords[1] +"  "+ datajson.data[i].property.loc.coordinates[1] + "  " +datajson.data[i].property.loc.coordinates[0])
                console.log(new Date(req.body.subleaseStart) >= new Date(datajson.data[i].property.availableFrom) && new Date(req.body.subleaseEnd) <= new Date(datajson.data[i].property.availableTo))
                console.log(datajson.data[i].property.loc.secondaryTxt.split(",")[datajson.data[i].property.loc.secondaryTxt.split(",").length-3])
                console.log("--------")

                if(new Date(req.body.subleaseStart) >= new Date(datajson.data[i].property.availableFrom) && new Date(req.body.subleaseEnd) <= new Date(datajson.data[i].property.availableTo) && (getDistInMiles(req.body.coords[0],  datajson.data[i].property.loc.coordinates[1], datajson.data[i].property.loc.coordinates[0],  req.body.coords[1]) <= 2 ||  datajson.data[i].property.loc.secondaryTxt.split(",")[datajson.data[i].property.loc.secondaryTxt.split(",").length-3] == req.body.location.split(",")[req.body.location.split(",").length-3]) && (Number(datajson.data[i].property.price) <= (Number(req.body.budget)+500))){
                    console.log("MATCH", datajson.data[i]._id)
                        User.updateOne(
                        { _id: datajson.data[i]._id },
                        [
                            {
                                $set: {
                                    cribConnectSubtenants: {
                                        $cond: [
                                            {
                                                $in: [mongoose.Types.ObjectId(subtenant_objid),"$cribConnectSubtenants"]
                                            },
                                            {
                                                $setDifference: ["$cribConnectSubtenants", [mongoose.Types.ObjectId(subtenant_objid)]]
                                            },
                                            {
                                                $concatArrays: ["$cribConnectSubtenants",[mongoose.Types.ObjectId(subtenant_objid)]]
                                            }
                                        ]
                                    }
                                }
                            }
                        ]
                    ).then(a => console.log(a))                }
            }

        })
        res.status(200).json({data: "Subtenant created", _id: result._id.toString()})
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

exports.add_subtenant_to_tenant = (req, res, next) => {
    const subtenant_id = req.body.subtenant_id
    const tenant_id = req.body.tenant_id
    console.log(req.body)
    User.updateOne(
      { _id: tenant_id },
      [
          {
              $set: {
                cribConnectSubtenants: {
                      $cond: [
                          {
                              $in: [mongoose.Types.ObjectId(req.body.subtenant_id),"$cribConnectSubtenants"]
                          },
                          {
                              $setDifference: ["$cribConnectSubtenants", [mongoose.Types.ObjectId(req.body.subtenant_id)]]
                          },
                          {
                              $concatArrays: ["$cribConnectSubtenants",[mongoose.Types.ObjectId(req.body.subtenant_id)]]
                          }
                      ]
                  }
              }
          }
      ]
  )
    .then(user => res.json({ msg: 'Updated successfully', matches: user.cribConnectSubtenants }))
    .catch(err =>
      res.status(400).json({ error: 'Unable to update the Database' })
    );
  
  };


  exports.clear_array = (req, res, next) => {
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
Subtenant.remove({}, function(err,removed) {

});
    User.update({}, {cribConnectSubtenants:[]})
    .then((data) => {
        res.status(200).json(data)
    })
    .catch(e => { res.status(400).json({data: "Error", e})})
}




exports.all_subtenants = (req, res, next) => {
    Subtenant.find()
    .then((data) => {
        console.log(data)
        res.status(200).json(data)
    })
    .catch(e => { res.status(400).json({data: "Error", e})})
}

exports.delete_by_phonenumber = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.userId
    if(userId != "6438e6cba9589c25c577b49e"){
        res.status(400).json({ error: 'unable to make request', errRaw: err })
    }else {
    var num = Number(req.body.phoneNumber.substr(String(req.body.phoneNumber).length - 10));
    Subtenant.findOne({phoneNumber: num})
    .then(async (data) => {
        console.log(data)
        await Subtenant.deleteOne({ _id: data._id });
        User.updateMany({}, { $pull: {cribConnectSubtenants: data._id}})
        .then(users => {
            console.log("Removed")
        })
        res.status(200).json(data)
    })
    .catch(e => { res.status(400).json({data: "Error", e})})
  }
}

// GET /messageSubtenantAvail
// Description check if subtenants are still available 

exports.message_subtenant_avail = (req, res, next) => {
//    let counter = 0;
//     Subtenant.find()
//     .then(subtenants => {
//         subtenants.forEach(subtenant => {
//             if(subtenant.phoneNumber.toString().length == 10){
//                 client.messages
//                 .create({
//                     body: `[Crib] Thank you for filling out the subleasing Google Form. Are you still looking for a sublease? Please reply Yes or No.`,
//                     from: '+18775226376',
//                     to: `+1${subtenant.phoneNumber}`
//                 })
//                 .then(message => {
//                     counter++;
//                 })
//                 .catch(err => res.status(400).json({ error: `Unable to send number to ${subtenant.name} @ ${subtenant.phoneNumber}`}));
//             }
//             console.log(subtenant.name + "   " + subtenant.phoneNumber)
//         })
//         res.json({"Message sent to": counter})
//     })
//     .catch(err => res.status(400).json({ data: "Error"}));
}


// @route: /getallmatches
// @description: Given the subtenant arr, retrieve all related subtenant information
// @access: private

exports.get_all_matches = (req,res,next) => {
    if(req.body.subArr == undefined || req.body.userId == undefined){
        res.status(404).json({data:"Incomplete data"})
    }
    else{
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userId = decoded.userId
        if(userId != req.body.userId){
            res.status(400).json({ Error: 'Failed auth'})
        }else {
           
            Subtenant.find({'_id': {$in: req.body.subArr}})
            .then(data => {
                res.status(200).json(data)
            })
            .catch( e => res.status(400).json({"Error": e}))
            
        }
    }

}




