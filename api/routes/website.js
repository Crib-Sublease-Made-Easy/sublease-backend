const express = require("express");
const router = express.Router();
const WebsiteController = require('../controller/lead');

router.post("/iosleads", WebsiteController.ios_leads)
router.post("/androidleads", WebsiteController.android_leads)
router.post("/leads", WebsiteController.collect_leads);
router.get("/leads", WebsiteController.get_leads);

module.exports = router; 