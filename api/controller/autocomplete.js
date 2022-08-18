var axios = require('axios');

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
            url: `https://maps.googleapis.com/maps/api/place/queryautocomplete/json?input=${query}&country:us&types=address&location=37.76999%2C-122.44696&radius=4000&strictbounds=true&key=AIzaSyBLCfWwROY3Bfvq_TOnDjX90wn2nCJF2nA`,
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
        url: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=AIzaSyBLCfWwROY3Bfvq_TOnDjX90wn2nCJF2nA`,
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
    if(address == undefined){
        res.json([])
    } else{  
        
    var config = {
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyBLCfWwROY3Bfvq_TOnDjX90wn2nCJF2nA`,
    };
    axios(config)
    .then(function (response) {
        let JSONdata = response.data
        console.log(JSONdata)
        res.json(JSONdata.results[0].geometry.location)      
    })
    .catch(function (error) {
        console.log(error);
        res.status(404).json({ error: 'invalid query' })
    });
    }
};