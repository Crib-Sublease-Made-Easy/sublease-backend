// Load Properies Model
const Property = require('../models/property');
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


//-----------Get an Image----------------
exports.get_image = async(req, res, next) => {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    const readstream = gridfsBucket.openDownloadStream(file._id);
   // var readstream = gfs.createReadStream({ filename: req.params.filename });
    readstream.on("error", function (err) {
      res.send("No image found with that title");
    });
    readstream.pipe(res);
  }
  
  


//************************* PROPERTY CONTROLLER ***************************//
// @route GET /properties
// @description lists all of the properties in the market
// @access public
exports.property_get_all = (req, res, next) => {
    Property.find()
        .then(proprties => res.json(proprties))
        .catch(err => res.status(404).json({ propertiesFound: 'none'}));
        
};

// @route GET /properties
// @description lists all of the properties in the market
// @access public
exports.property_query = (req, res, next) => {
    console.log("lat", req.query.latitude)
    console.log("long", req.query.longitude)
    console.log("maxdist", req.query.maxDistance)
    // type: req.query.type,
    // price: {$gte: req.query.priceLow, $lte: req.query.priceHigh},
    // bedroom: req.query.bedroom,
    // bathroom: req.query.bathroom,
    // petsAllowed: req.query.petsAllowed,
    // ableToRenew: req.query.ableToRenew,
    // wifi: req.query.wifi,
    // onSiteWasherDryer: req.query.onSiteWasherDryer,
    // utilitiesIncluded: req.query.utilitiesIncluded,
    // furnished: 
    query = req.query
    if(query.priceLow != undefined || query.priceHigh != undefined){
        price = {$gte: req.query.priceLow, $lte: req.query.priceHigh}
        req.query.price = price
    }
    var coords = [];
    if(! (query.latitude == undefined && query.longitude == undefined)){
        coords[0] = req.query.longitude;
        coords[1] = req.query.latitude;
        console.log(coords)
        query.loc = {
                    $near :
                   {
                     $geometry : {
                        type : "Point" ,
                        coordinates : coords},
                     $maxDistance : req.query.maxDistance
                   }
             }
        
    }
    delete query.priceHigh
    delete query.priceLow
    delete query.latitude
    delete query.longitude
    delete query.maxDistance
    console.log("QUERY", JSON.stringify(query))

    Property.find(query, null, { skip: req.query.page * 4, limit: 4})
    .then(proprties => res.json(proprties))
    .catch(err => res.status(404).json({ propertiesFound: 'none', error: err}));

};


// @route GET /properties/:id
// @description Get single property by id
// @access Public
exports.property_get_one = async (req, res, next) => {
    await Property.findById(req.params.id)
      .then( async property => {
        await User.findById(property.postedBy).then( async user => {
            postedUserInfo = {}
            postedUserInfo.firstName= user.firstName
            postedUserInfo.lastName= user.lastName
            postedUserInfo.profilePic = user.profilePic
            changeNumberOfViews = {}
            changeNumberOfViews.numberOfViews = property.numberOfViews + 1;
            console.log("ChangeNumberOfViews,", changeNumberOfViews)
            await Property.findByIdAndUpdate(property._id, changeNumberOfViews)
            .then(property => console.log("Successfully changed", property))
            .catch(err =>
              console.log("Error with incrementing view count", err)
            );
            
            res.json({propertyInfo: property, postedUserInfo: postedUserInfo}) 
        })
        .catch(err => res.status(404).json({ propertiesFound: 'Invalid User in Property soldBy field' }));
      })
      .catch(err => res.status(404).json({ propertiesFound: 'No Property found' }));
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
        propImgList[i] = ('https://sublease-app.herokuapp.com/properties/propertyImages/' + req.files[i].filename)
      }
    var coor = []
    coor[0] = req.body.longitude
    coor[1] = req.body.latitude
    const property = new Property({
        //_id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        type: req.body.type,
        location: req.body.location,
        timePosted: req.body.timePosted,
        postedBy: decoded.userId,
        price: req.body.price,
        availableFrom: req.body.availableFrom,
        availableTo: req.body.availableTo,
        imgList: propImgList,
        furnished: req.body.furnished,
        moveinFlexiblity: req.body.moveinFlexiblity,
        renew: req.body.renew,
        pets: req.body.pets,
        parking: req.body.parking,
        onSiteWasherDryer: req.body.onSiteWasherDryer,
        description: req.body.description,
        bed: req.body.bed,
        bath: req.body.bath,
        sharedRoom: req.body.sharedRoom,
        utilitiesIncluded: req.body.utilitiesIncluded,
        loc: {
            type: "Point",
            coordinates: coor
        },
        deleted: false,
        numberOfViews: 0
      });
      property
      .save()
      .then(property => res.json({ msg: 'property added successfully' }))
      .catch(err => res.status(400).json({ error: 'Unable to add this property', errRaw: err }));
  };
  
  // @route PUT /properties/:id
  // @description Update property
  // @access Public
  exports.property_modify= (req, res, next) => {
      Property.findByIdAndUpdate(req.params.id, req.body)
      .then(property => res.json({ msg: 'Updated successfully' }))
      .catch(err =>
        res.status(400).json({ error: 'Unable to update the Database' })
      );
  };
  
  // @route DELETE /properties/:id
  // @description Delete property by id
  // @access Public
  exports.property_delete = (req, res, next) => {
      Property.findByIdAndRemove(req.params.id, req.body)
      .then(property => res.json({ mgs: 'Property deleted successfully' }))
      .catch(err => res.status(404).json({ error: 'No such a property' }));
  };


