// Load Properies Model
const Property = require('../models/property');
const Completed = require('../models/completed');
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');

// ------------ Image Specific Code----------

const Grid = require('gridfs-stream');

const dbInstance = mongoose.connection;

let gfs, gridfsBucket;


dbInstance.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(dbInstance.db, {
    bucketName: 'propertyImages'
  });

  gfs = Grid(dbInstance.db, mongoose.mongo);
  gfs.collection('propertyImages');
})


// //-----------Get an Image----------------
exports.get_image = async (req, res, next) => {
  const file = await gfs.files.findOne({ filename: req.params.filename });
  console.log("FILE", file)
  if(file !=null){
  const readstream = gridfsBucket.openDownloadStream(file._id);
  // var readstream = gfs.createReadStream({ filename: req.params.filename });
  readstream.on("error", function (err) {
    res.send("No image found with that title");
  });
  
  readstream.pipe(res);
}
}
//-----------Get an Image----------------
// exports.get_image = async (req, res, next) => {
//   await gfs.files.findOne({ filename: req.params.filename })
//   .then((response) =>{
//     console.log("response" , response);
//     gridfsBucket.openDownloadStream(response._id);
//   })
//   // var readstream = gfs.createReadStream({ filename: req.params.filename });
//   // readstream.on("error", function (err) {
//   //   res.send("No image found with that title");
//   // // });
//   // readstream.pipe(res);
// }




//************************* PROPERTY CONTROLLER ***************************//
// @route GET /properties
// @description lists all of the properties in the market
// @access public
exports.property_get_all = (req, res, next) => {
  Property.find()
    .then(proprties => res.json(proprties))
    .catch(err => res.status(404).json({ propertiesFound: 'none' }));

};

// @route GET /properties
// @description lists all of the properties in the market
// @access public
exports.property_query = (req, res, next) => {

  console.log("lat", req.query.latitude)
  console.log("long", req.query.longitude)
  console.log("maxdist", req.query.maxDistance)
  query = req.query
  
  //AVAILABILITY
  console.log("PROPERTTY QUERY", req.query)
  if(req.query.availableFrom != undefined){
    if(req.query.availableTo != undefined){
      console.log("SETTING AVAILABLE QUERY")
      const to = req.query.availableTo
      const from = req.query.availableFrom
      query.availableFrom ={"$lte": to}
      query.availableTo = {"$gte": from}
    } 
  }



  amens = []
  if(query.Pet_Friendly != undefined){
    amens.push('Pet_Friendly')
    delete query.Pet_Friendly
  }
  if(query.Garages != undefined){
    amens.push('Garages')
    delete query.Garages
  }
  if(query.Swimming_Pool != undefined){
    amens.push('Swimming_Pool')
    delete query.Swimming_Pool
  }
  if(query.Wifi != undefined){
    amens.push('Wifi')
    delete query.Wifi
  }
  if(query.Gym != undefined){
    amens.push('Gym')
    delete query.Gym
  }
  if(query.Washer_Dryer != undefined){
    amens.push('Washer_Dryer')
    delete query.Washer_Dryer
  }
  if(query.Gated_Access != undefined){
    amens.push('Gated_Access')
    delete query.Gated_Access
  }
  if(query.Public_Transportation != undefined){
    amens.push('Public_Transportation')
    delete query.Public_Transportation
  }
  if(query.Heating_Cooling != undefined){
    amens.push('Heating_Cooling')
    delete query.Heating_Cooling
  }
  if(query.Microwave != undefined){
    amens.push('Microwave')
    delete query.Microwave
  }
  if(query.Grill != undefined){
    amens.push('Grill')
    delete query.Grill
  }
  if(query.TV != undefined){
    amens.push('TV')
    delete query.TV
  }
  if(query.Fridge != undefined){
    amens.push('Fridge')
    delete query.Fridge
  }
  if(query.Couch != undefined){
    amens.push('Couch')
    delete query.Couch
  }
  if(query.Oven != undefined){
    amens.push('Oven')
    delete query.Oven
  }
  if(query.Mattress != undefined){
    amens.push('Mattress')
    delete query.Mattress
  }
  if(query.Coffee_Maker != undefined){
    amens.push('Coffee_Maker')
    delete query.Coffee_Maker
  }
  if(query.Toaster != undefined){
    amens.push('Toaster')
    delete query.Toaster
  }
  if(query.Dishes != undefined){
    amens.push('Dishes')
    delete query.Dishes
  }
  if(query.Pots_Pans != undefined){
    amens.push('Pots_Pans')
    delete query.Pots_Pans
  }
  if(query.Utilities_Included != undefined){
    amens.push('Utilities_Included')
    delete query.Utilities_Included
  }
  if(query.Walkin_Closet != undefined){
    amens.push('Walkin_Closet')
    delete query.Walkin_Closet
  }
  if(query.Iron != undefined){
    amens.push('Iron')
    delete query.Iron
  }
  if(query.Freezer != undefined){
    amens.push('Freezer')
    delete query.Freezer
  }
  if(query.Balcony != undefined){
    amens.push('Balcony')
    delete query.Balcony
  }
  if(query.Street_Parking != undefined){
    amens.push('Street_Parking')
    delete query.Street_Parking
  }
  if(query.Pet_FrParking_on_Premesisiendly != undefined){
    amens.push('Parking_on_Premesis')
    delete query.Parking_on_Premesis
  }
  
  if(amens.length != 0){

    query.amenities =  {
      $all: amens
    }
  }

  if (query.priceLow != undefined || query.priceHigh != undefined) {
    price = { $gte: req.query.priceLow, $lte: req.query.priceHigh }
    req.query.price = price
  }
  var coords = [];
  maxDistance = 1600 * 10;
  if (query.maxDistance != undefined) {
    maxDistance = query.maxDistance * 1600;
  }
  if (!(query.latitude == undefined && query.longitude == undefined)) {
    coords[0] = req.query.longitude;
    coords[1] = req.query.latitude;
    console.log(coords)
    query.loc = {
      $near:
      {
        $geometry: {
          type: "Point",
          coordinates: coords
        },
        $maxDistance: maxDistance
      }
    }

  }
  delete query.priceHigh
  delete query.priceLow
  delete query.latitude
  delete query.longitude
  delete query.maxDistance
  query.deleted = false
  console.log("QUERY", JSON.stringify(query))

  Property.find(query, null, { skip: req.query.page * 4, limit: 4 })
    .then( async properties => {
      console.log(properties)
      let arr = properties
      let i = 0;
      let props = await Promise.all(properties.map(async p => {
            if(p.postedBy != null){
              let d = await User.findById(p.postedBy).then(async user => {
              let q = p

              postedUser = {}
              postedUser.firstName = user._id;
              postedUser.firstName = user.firstName;
              postedUser.lastName = user.lastName;
              postedUser.profilePic = user.profilePic;
              postedUser.occupation = user.occupation;
              postedUser.school = user.school;
              q.pos = postedUser
              console.log("P", q)
              return postedUser

              })
              let q = {}
              q.propertyInfo = p
              q.userInfo = d
              return q
            }
            else{
              let q = {}
              let d = {}
              q.propertyInfo = p
              q.userInfo = d
              return q
            }
            
       
            
        }))
        // console.log("END", props)
        res.json(props)
    })
    .catch(err => res.status(404).json({ propertiesFound: 'none', error: err }));

};



// @route GET /properties
// @description lists all of the properties in the market
// @access public
exports.property_get_all = (req, res, next) => {
  Property.find()
    .then(proprties => res.json(proprties))
    .catch(err => res.status(404).json({ propertiesFound: 'none' }));

};

// @route GET /properties
// @description lists all of the properties in the market
// @access public
exports.property_favorite = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  console.log("DECODED", decoded)
  console.log("PROPERTY ID", req.body.propertyId)
  console.log("BODY", req.body)

  User.updateOne(
    { _id: decoded.userId },
    [
        {
            $set: {
              favoriteProperties: {
                    $cond: [
                        {
                            $in: [mongoose.Types.ObjectId(req.body.propertyId),"$favoriteProperties"]
                        },
                        {
                            $setDifference: ["$favoriteProperties", [mongoose.Types.ObjectId(req.body.propertyId)]]
                        },
                        {
                            $concatArrays: ["$favoriteProperties",[mongoose.Types.ObjectId(req.body.propertyId)]]
                        }
                    ]
                }
            }
        }
    ]
)
  .then(user => res.json({ msg: 'Updated successfully', favorited: user.favoriteProperties }))
  .catch(err =>
    res.status(400).json({ error: 'Unable to update the Database' })
  );

};


// @route GET /properties
// @description lists all of the properties in the market
// @access public
exports.property_pins = (req, res, next) => {
  console.log("lat", req.query.latitude)
  console.log("long", req.query.longitude)
  console.log("maxdist", req.query.maxDistance)
  // type: req.query.type,
  query = req.query
  
  //AVAILABILITY
  console.log(req.query)
  if(req.query.availableFrom != undefined){
    if(req.query.availableTo != undefined){
      console.log("SETTING AVAILABLE QUERY")
      const to = req.query.availableTo
      const from = req.query.availableFrom
      query.availableFrom ={"$lte": to}
      query.availableTo = {"$gte": from}
    } 
  }
  //AMENITIES
  amens = []
  if(query.Pet_Friendly != undefined){
    amens.push('Pet_Friendly')
    delete query.Pet_Friendly
  }
  if(query.Garages != undefined){
    amens.push('Garages')
    delete query.Garages
  }
  if(query.Swimming_Pool != undefined){
    amens.push('Swimming_Pool')
    delete query.Swimming_Pool
  }
  if(query.Wifi != undefined){
    amens.push('Wifi')
    delete query.Wifi
  }
  if(query.Gym != undefined){
    amens.push('Gym')
    delete query.Gym
  }
  if(query.Washer_Dryer != undefined){
    amens.push('Washer_Dryer')
    delete query.Washer_Dryer
  }
  if(query.Gated_Access != undefined){
    amens.push('Gated_Access')
    delete query.Gated_Access
  }
  if(query.Public_Transportation != undefined){
    amens.push('Public_Transportation')
    delete query.Public_Transportation
  }
  if(query.Heating_Cooling != undefined){
    amens.push('Heating_Cooling')
    delete query.Heating_Cooling
  }
  if(query.Microwave != undefined){
    amens.push('Microwave')
    delete query.Microwave
  }
  if(query.Grill != undefined){
    amens.push('Grill')
    delete query.Grill
  }
  if(query.TV != undefined){
    amens.push('TV')
    delete query.TV
  }
  if(query.Fridge != undefined){
    amens.push('Fridge')
    delete query.Fridge
  }
  if(query.Couch != undefined){
    amens.push('Couch')
    delete query.Couch
  }
  if(query.Oven != undefined){
    amens.push('Oven')
    delete query.Oven
  }
  if(query.Mattress != undefined){
    amens.push('Mattress')
    delete query.Mattress
  }
  if(query.Coffee_Maker != undefined){
    amens.push('Coffee_Maker')
    delete query.Coffee_Maker
  }
  if(query.Toaster != undefined){
    amens.push('Toaster')
    delete query.Toaster
  }
  if(query.Dishes != undefined){
    amens.push('Dishes')
    delete query.Dishes
  }
  if(query.Pots_Pans != undefined){
    amens.push('Pots_Pans')
    delete query.Pots_Pans
  }
  if(query.Utilities_Included != undefined){
    amens.push('Utilities_Included')
    delete query.Utilities_Included
  }
  if(query.Walkin_Closet != undefined){
    amens.push('Walkin_Closet')
    delete query.Walkin_Closet
  }
  if(query.Iron != undefined){
    amens.push('Iron')
    delete query.Iron
  }
  if(query.Freezer != undefined){
    amens.push('Freezer')
    delete query.Freezer
  }
  if(query.Balcony != undefined){
    amens.push('Balcony')
    delete query.Balcony
  }
  if(query.Street_Parking != undefined){
    amens.push('Street_Parking')
    delete query.Street_Parking
  }
  if(query.Pet_FrParking_on_Premesisiendly != undefined){
    amens.push('Parking_on_Premesis')
    delete query.Parking_on_Premesis
  }
  
  if(amens.length != 0){

    query.amenities =  {
      $all: amens
    }
  }





  if (query.priceLow != undefined || query.priceHigh != undefined) {
    price = { $gte: req.query.priceLow, $lte: req.query.priceHigh }
    req.query.price = price
  }
  var coords = [];
  maxDistance = 1600 * 10;
  if (query.maxDistance != undefined) {
    maxDistance = query.maxDistance * 1600;
  }
  if (!(query.latitude == undefined && query.longitude == undefined)) {
    coords[0] = req.query.longitude;
    coords[1] = req.query.latitude;
    console.log(coords)
    query.loc = {
        $near:
        {
          $geometry: {
            type: "Point",
            coordinates: coords
          },
          $maxDistance: maxDistance
        }
  
    }

  }
  delete query.priceHigh
  delete query.priceLow
  delete query.latitude
  delete query.longitude
  delete query.maxDistance

  query.deleted = false
  console.log("PINSQUERY", query)
  Property.find(query, '_id loc price imgList availableFrom availableTo bed bath postedBy title amenities')
    .then(proprties => res.json(proprties))
    .catch(err => res.status(404).json({ propertiesFound: 'none', error: err }));

};




// @route GET /properties/:id
//            /properties/:id/:discover

// @description Get single property by id
// @access Public
exports.increment_view_count = async (req, res, next) => {
  await Property.findById(req.params.id)
    .then(async property => {
        let views = property.numberOfViews + 1
        await Property.findByIdAndUpdate(property._id, {numberOfViews: views})
          .then(property => {
            res.json({status: "Successfully changed"})
            console.log("Successfully changed")
          
          })
          .catch(err =>
            console.log("Error with incrementing view count", err)
          );

        
    })
    .catch(err => res.status(404).json({ propertiesFound: 'No Property found' }));
};



// @route GET /properties/:id
// @description Get single property by id
// @access Public
exports.property_get_one = async (req, res, next) => {
  await Property.findById(req.params.id)
    .then(async property => {
      await User.findById(property.postedBy).then(async user => {
        postedUserInfo = {}
        postedUserInfo.firstName = user._id
        postedUserInfo.firstName = user.firstName
        postedUserInfo.lastName = user.lastName
        postedUserInfo.profilePic = user.profilePic
        postedUserInfo.occupation = user.occupation;
        postedUserInfo.school = user.school;
        changeNumberOfViews = {}
        console.log(req.body.viewCount)
        if(String(req.body.viewCount) === "true"){
          changeNumberOfViews.numberOfViews = property.numberOfViews + 1;
          console.log("INCREMENT")
        } else{
          changeNumberOfViews.numberOfViews = property.numberOfViews;
          console.log("VIEW COUNT NOT CHANGED")
        }
        await Property.findByIdAndUpdate(property._id, changeNumberOfViews)
        .then(property => {
          console.log("Successfully changed")
        })
        .catch(err =>
          console.log("Error with incrementing view count", err)
        );
        console.log("ChangeNumberOfViews,", changeNumberOfViews)
        res.json({ propertyInfo: property, userInfo: postedUserInfo })
      })
        .catch(err => res.status(404).json({ Error: 'Invalid User in Property soldBy field' }));
    })
    .catch(err => res.status(404).json({ Error: 'No Property found' }));
};

// @route POST /properties
// @description post property
// @access Public
exports.property_create = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  console.log(JSON.stringify(req.files))
  propImgList = []
  for (let i = 0; i < req.files.length; i++) {
    propImgList[i] = ('https://crib-llc.herokuapp.com/properties/propertyImages/' + req.files[i].filename)
  }
  var coor = []
  coor[0] = req.body.longitude
  coor[1] = req.body.latitude
  const property = new Property({
    //_id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    type: req.body.type,
    timePosted: req.body.timePosted,
    postedBy: decoded.userId,
    price: req.body.price,
    availableFrom: req.body.availableFrom,
    availableTo: req.body.availableTo,
    imgList: propImgList,
    amenities: req.body.amenities,
    description: req.body.description,
    bed: req.body.bed,
    bath: req.body.bath,
    securityDeposit: req.body.securityDeposit,
    availabilityFlexibility: req.body.availabilityFlexibility,
    loc: {
      type: "Point",
      coordinates: coor,
      streetAddr: req.body.streetAddr,
      secondaryTxt: req.body.secondaryTxt,
    },
    deleted: false,
    numberOfViews: 0
  });
  property
    .save()
    .then(async (property) => {
      console.log(property)
      console.log(decoded.userId)
      User.findOneAndUpdate(
        { _id: decoded.userId },
        { $push: { postedProperties: property._id } },

        function (err, model) {
          if (err) {
            //console.log(err);
            return res.send(err);
          }
        }
      )

      res.json({ msg: 'property added successfully' })
    })
    .catch(err => res.status(400).json({ error: 'Unable to add this property', errRaw: err }));
};

// @route POST /properties
// @description post property with scraped data
// @access Public
exports.property_scraped_images = (req, res, next) => {
//   const token = req.headers.authorization.split(" ")[1];
//   const decoded = jwt.verify(token, process.env.JWT_KEY);
propImgList = []

  if(req.files != undefined){
    console.log(JSON.stringify(req.files))
    for (let i = 0; i < req.files.length; i++) {
      propImgList[i] = ('https://crib-llc.herokuapp.com/properties/propertyImages/' + req.files[i].filename)
    }
  }
    res.json({ msg:  propImgList})
};

// @route POST /properties
// @description post property with scraped data
// @access Public
exports.property_scraped = (req, res, next) => {
  //   const token = req.headers.authorization.split(" ")[1];
  //   const decoded = jwt.verify(token, process.env.JWT_KEY);
      propImgList = [req.body.propImg0, req.body.propImg1, req.body.propImg2, req.body.propImg3]
      var coor = []
      coor[0] = req.body.longitude
      coor[1] = req.body.latitude
      console.log("COORDS: " + coor)
      console.log("BODY: " + JSON.stringify(req.body))
      
    const property = new Property({
      //_id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      type: req.body.type,
      timePosted: req.body.timePosted,
      postedBy: null,
      price: req.body.price,
      availableFrom: req.body.availableFrom,
      availableTo: req.body.availableTo,
      imgList: propImgList,
      amenities: req.body.amenities,
      description: req.body.description,
      bed: req.body.bed,
      bath: req.body.bath,
      securityDeposit: req.body.securityDeposit,
      availabilityFlexibility: req.body.availabilityFlexibility,
      loc: {
        type: "Point",
        coordinates: coor,
        streetAddr: req.body.streetAddr,
        secondaryTxt: req.body.secondaryTxt,
      },
      deleted: false,
      numberOfViews: 0
    });
    console.log("PROPERTY OBJECT")
    console.log(property)
    property
    .save()
    .then(async (property) => {
      res.json({ msg: 'property added successfully' })
    })
    .catch(err => res.status(400).json({ error: 'Unable to add this property', errRaw: err }));
  };

// @route PUT /properties/:id
// @description Update property
// @access Public
exports.property_modify = async(req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const userId = decoded.userId
    Property.findById(req.params.id)
    .then(async property => {
      if(userId == property.postedBy ){
      Property.findByIdAndUpdate(req.params.id, req.body)
        .then(prop => res.json({ msg: 'Updated successfully' }))
        .catch(err =>
          res.status(400).json({ error: 'Unable to update the Database' })
        );
      }else{
        return res.status(401).json({
          message: 'Auth failed'
        });
      }
    })    
};


// @route PUT /properties/:id
// @description Update property
// @access Public
exports.property_modify_image = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const userId = decoded.userId
  Property.findById(req.params.id)
  .then(async property => {
    if(userId == property.postedBy ){
  if(req.body.changeIdx == 0){
    Property.findByIdAndUpdate(req.params.id, {"imgList.0" : 'https://crib-llc.herokuapp.com/properties/propertyImages/' + req.file.filename})
      .then(property => res.json({ 
        msg: 'Updated successfully', 
        propertyImage: 'https://crib-llc.herokuapp.com/properties/propertyImages/' + req.file.filename
      }))
      .catch(err =>
        res.status(400).json({ error: err})
      );
  } else if(req.body.changeIdx == 1){
    Property.findByIdAndUpdate(req.params.id, {"imgList.1" : 'https://crib-llc.herokuapp.com/properties/propertyImages/' + req.file.filename})
    .then(property => res.json({ 
      msg: 'Updated successfully', 
      propertyImage: 'https://crib-llc.herokuapp.com/properties/propertyImages/' + req.file.filename
    }))
    .catch(err =>
      res.status(400).json({ error: err})
    );
  } else if(req.body.changeIdx == 2){
    Property.findByIdAndUpdate(req.params.id, {"imgList.2" : 'https://crib-llc.herokuapp.com/properties/propertyImages/' + req.file.filename})
    .then(property => res.json({ 
      msg: 'Updated successfully', 
      propertyImage: 'https://crib-llc.herokuapp.com/properties/propertyImages/' + req.file.filename
    }))
    .catch(err =>
      res.status(400).json({ error: err})
    );
  } else if(req.body.changeIdx == 3){
    Property.findByIdAndUpdate(req.params.id, {"imgList.3" : 'https://crib-llc.herokuapp.com/properties/propertyImages/' + req.file.filename})
    .then(property => res.json({ 
      msg: 'Updated successfully', 
      propertyImage: 'https://crib-llc.herokuapp.com/properties/propertyImages/' + req.file.filename
    }))
    .catch(err =>
      res.status(400).json({ error: err})
    );
  } else if(req.body.changeIdx == 4){
    Property.findByIdAndUpdate(req.params.id, {"imgList.4" : 'https://crib-llc.herokuapp.com/properties/propertyImages/' + req.file.filename})
    .then(property => res.json({ 
      msg: 'Updated successfully', 
      propertyImage: 'https://crib-llc.herokuapp.com/properties/propertyImages/' + req.file.filename
    }))
    .catch(err =>
      res.status(400).json({ error: err})
    );
  }
}else{
  return res.status(401).json({
    message: 'Auth failed'
  });
}
})
};

// @route DELETE /properties/:id
// @description Delete property by id
// @access Public
exports.property_delete = async (req, res, next) => {
  // Property.findByIdAndRemove(req.params.id, query)
  //   .then(property => res.json({ mgs: 'Property deleted successfully' }))
  //   .catch(err => res.status(404).json({ error: 'No such a property' }));
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);

  await Property.findByIdAndUpdate(req.params.id, {deleted: true})
  .then(async property => {
    await User.updateOne(
      { _id: decoded.userId },
      [
          {
              $set: {
                postedProperties: {
                              $setDifference: ["$postedProperties", [req.params.id]]
                  }
              }
          }
      ]
  )
  

  })
  .catch(err =>
    res.status(400).json({ error: 'Unable to update the Database' })
  );
  return res.json({ msg: 'Updated successfully' })
};

// @route PUT /properties/:id
// @description Update property
// @access Public
exports.sublease_successful = async(req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const userId = decoded.userId
  const propId = req.body.propId
  const completed_obj = new Completed(
    { propId: propId,  
      time: Date(),
      userId: userId
    });
  completed_obj
  .save()
  .then(async (property) => {
    res.json({ msg: 'Property was successfully subleased' })
  })
  .catch(err => res.status(400).json({ error: 'Unable to sublease property ', errRaw: err }));
};