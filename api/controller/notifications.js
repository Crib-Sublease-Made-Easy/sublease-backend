const onesignal = require('api')('@onesignal/v9.0#e8ds50l6axnfm1');
const User = require('../models/user');

// @route POST
// @description Send a notification for a chat message
// @access Private
exports.send_message = async (req, res, next) => {
    let senderId = req.body.senderId
    let part1 = req.body.participant1
    let part2 = req.body.participant2
    let recipient

    if(senderId == part1){
      recipient = part2
    } else if (senderId == part2){
      recipient = part1
    }
  
    await User.findById(recipient).then(user =>{
      onesignal.createNotification({
        include_player_ids: [recipient],
          contents: {
            en: req.body.message,
          },
          name: 'CRIB_CHAT'
        }, {
          authorization: 'ZGQ0ODYzMDAtYjEzMy00ZjUyLTkxZmEtYzUzMTFiNGFmYmMz'
        })
      res.json({status: "Notification Successfully Sent"})

    }).catch(Exception=>
      res.status(404).json({ error: 'No such uuser' })
    )



}; 
  

