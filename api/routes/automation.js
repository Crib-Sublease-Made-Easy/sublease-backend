const express = require("express");
const router = express.Router();
const AutomationController = require('../controller/automation');

router.get("/instagram", AutomationController.automate_instagram);
//For those who are looking for sublease before April 17
router.get("/googleform", AutomationController.automate_google_form);

router.post("/cribconnectreminder", AutomationController.automate_crib_connect_reminder)

module.exports = router;