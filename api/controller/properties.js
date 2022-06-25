// Load Properies Model
const Property = require('../models/property');
const mongoose = require("mongoose");


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


// @route GET /properties/:id
// @description Get single property by id
// @access Public
exports.property_get_one = (req, res, next) => {
    Property.findById(req.params.id)
      .then(property => res.json(property))
      .catch(err => res.status(404).json({ propertiesFound: 'No Property found' }));
  };
  
  // @route POST /properties
  // @description post property
  // @access Public
  exports.property_create = (req, res, next) => {
    console.log(JSON.stringify(req))
    console.log(JSON.stringify(req.files))
    propImgList = []
    for (let i = 0; i < req.files.length; i++) {
        propImgList[i] = ('https://sublease-app.herokuapp.com/properties/propertyImages/' + req.files[i].filename)
      }
    
    const property = new Property({
        //_id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        type: req.body.type,
        location: req.body.location,
        timePosted: req.body.timePosted,
        postedBy: req.body.postedBy,
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


