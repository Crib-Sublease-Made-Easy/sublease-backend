// Load Properies Model
const Property = require('../models/property');
const mongoose = require("mongoose");




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
        Property.create(req.body)
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


