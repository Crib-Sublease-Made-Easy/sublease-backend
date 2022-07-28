var axios = require('axios');

// @route GET /properties/:id
// @description Delete property by id
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
            res.json(JSONdata.predictions )      
        })
        .catch(function (error) {
            console.log(error);
            res.status(404).json({ error: 'invalid query' })
        });
        }
  };
  