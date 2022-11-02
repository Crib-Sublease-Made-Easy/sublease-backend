const express = require("express");
const router = express.Router();
const WebsiteController = require('../controller/lead');


router.post("/leads", WebsiteController.collect_leads);

module.exports = router; 