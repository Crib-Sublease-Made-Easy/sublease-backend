const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");






//************************* TOKEN CONTROLLER ***************************//


// @route POST /token/accessRefresh
// @description provided a valid refresh token, an access token will  be sent as response
// @access private
exports.regenerate_access_token = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userData = decoded;
  User.find({ email: req.userData.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Authentication Failed"
        });
      }
      else{
        const token = jwt.sign(
          {
            email: user[0].email,
            userId: user[0]._id
          },
          process.env.JWT_KEY,
          {
              expiresIn: "100d"
          }
        );
        console.log("TOKEN: ", token)
        return res.status(200).json({
          message: "Access Token Sent",
          accessToken: token
        });
      }
      })

    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};




