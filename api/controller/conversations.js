const User = require("../models/users");

// @route GET /conversations/:user_id/:page_number
// @description Get conversations for a user
// @access Public
exports.conversation_get_page = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.userId;
    if (userId == req.params.id) {
        User.findById(req.params.id)
            .then((user) => {
                res.json(user);
            })
            .catch((err) =>
                res.status(404).json({ usersFound: "No User found" })
            );
    } else {
        return res.status(401).json({
            message: "Auth failed",
        });
    }
};
