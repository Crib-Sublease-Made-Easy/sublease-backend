const express = require("express");
const router = express.Router();
const RequestController = require('../controller/requests');
const checkAuth = require('../middleware/check-auth');


router.post("/", checkAuth, RequestController.requests_create);
router.put("/accepted", checkAuth, RequestController.requests_accepted);


module.exports = router; 