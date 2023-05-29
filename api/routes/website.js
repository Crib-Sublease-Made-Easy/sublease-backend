const express = require("express");
const router = express.Router();
const WebsiteController = require('../controller/lead');
const checkAuth = require("../middleware/check-auth");


router.post("/iosleads", WebsiteController.ios_leads)
router.post("/cribconnectleads", WebsiteController.crib_connect_leads)
router.post("/lookingforsublease", WebsiteController.looking_for_sublease)
router.post("/androidleads", WebsiteController.android_leads)
router.post("/leads", WebsiteController.collect_leads);
router.get("/leads", WebsiteController.get_leads);
router.post("/cribconnectreminder", WebsiteController.crib_connect_reminder)
router.get("/privacydetails", WebsiteController.privacy_details)
router.get("/termsofservicesdetails", WebsiteController.termsofservices_details)

// router.post("/postingasublease", WebsiteController.posting_a_sublease)
// router.post("/generateFacebookPost",checkAuth, WebsiteController.gen_fb_post);

module.exports = router; 