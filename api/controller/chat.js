var axios = require('axios');
var sendbird_api_key = process.env.SENDBIRD_API_TOKEN;
var sendbird_app_id = process.env.SENDBIRD_APP_ID;

// @route GET 
// @description List all locations given a query
// @access Public
exports.hide_channel = (req, res, next) => {
        let channel_url = req.params.query    
        let user_id = req.body.user_id    

        if(channel_url == undefined || user_id == undefined){
            res.json([])
        } else{  
            fetch(`https://api-${sendbird_app_id}.sendbird.com/v3/group_channels/${channel_url}/hide`, {
                method: 'GET',
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Api-Token': sendbird_api_key 
                },
                body:JSON.stringify({
                    user_id: req.body.user_id,
                    should_hide_all: true
                })                
            }) 
                .then(res => res.json()).then(async response =>{
                    res.json({ msg: 'Channel hidden successfully' })
                })
                .catch(e=>{
                    res.status(404).json({ error: 'invalid query' })
                })
        }
  };
  
