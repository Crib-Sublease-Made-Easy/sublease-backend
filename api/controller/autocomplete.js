var axios = require('axios');
var google_api_key = process.env.GOOGLE_API_KEY;
const UserSearches = require('../models/user_searches');

// @route GET 
// @description List all locations given a query
// @access Public
exports.places_autocomplete = (req, res, next) => {
        let query = req.params.query    
        if(query == undefined){
            res.json([])
        } else{  
            
        var config = {
            method: 'get',
            url: `https://maps.googleapis.com/maps/api/place/queryautocomplete/json?input=${query}&country:us&types=address&location=37.76999%2C-122.44696&radius=4000&strictbounds=true&key=${google_api_key}`,
        };
        axios(config)
        .then(function (response) {
            let JSONdata = response.data
            const array = JSONdata.predictions.filter(place => place.place_id != undefined);
            res.json(array )      
        })
        .catch(function (error) {
            console.log(error);
            res.status(404).json({ error: 'invalid query' })
        });
        }
  };
  

// @route GET 
// @description List all locations given a query
// @access Public
exports.reverse_geocoding = (req, res, next) => {
    let lat = req.query.lat 
    let long = req.query.long 
    console.log(req.query)
    if(lat == undefined || long == undefined){
        res.status(404).json({ error: 'invalid query' })
    } else{  
        
    var config = {
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${google_api_key}`,
    };
    axios(config)
    .then(function (response) {
        let JSONdata = response.data
        res.json({formatted_address: JSONdata.results[0].formatted_address})      
    })
    .catch(function (error) {
        console.log(error);
        res.status(404).json({ error: 'invalid query' })
    });
    }
};



// @route GET 
// @description Given address return lat and long
// @access Public
exports.geocoding = (req, res, next) => {
    let address = req.query.address    
    userId = null
    if(req.body.userId == null || req.body.userId == undefined){
        userId = "NULL"
    }
    if(address == undefined){
        res.json([])
    } else{  
        
    var config = {
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${google_api_key}`,
    };
    axios(config)
    .then(function (response) {
        let JSONdata = response.data
        console.log(JSONdata)
        const usersearches = new UserSearches({
            userId: userId,
            address: req.body.address,
            coords: JSONdata.results[0].geometry.location,
          });
          usersearches
            .save()

        res.json(JSONdata.results[0].geometry.location)      
        
    })
    .catch(function (error) {
        console.log(error);
        res.status(404).json({ error: 'invalid query' })
    });
    }
};

// @route GET 
// @description Given address return lat and long
// @access Public
exports.geocoding_all = (req, res, next) => {
    let address = req.query.address    
    if(address == undefined){
        res.json([])
    } else{  
        
    var config = {
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${google_api_key}`,
    };
    axios(config)
    .then(function (response) {
        let JSONdata = response.data
        console.log(JSONdata)
       
        res.json(JSONdata.results[0])    
       
    })
    .catch(function (error) {
        console.log(error);
        res.status(404).json({ error: 'invalid query' })
    });
    }
};
