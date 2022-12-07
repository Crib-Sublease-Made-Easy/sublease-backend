const express = require("express");
const router = express.Router();
const WebsiteController = require('../controller/lead');


router.post("/leads", WebsiteController.collect_leads);
router.get("/leads", WebsiteController.get_leads);

module.exports = router; 