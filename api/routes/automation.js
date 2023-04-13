const express = require("express");
const router = express.Router();
const AutomationController = require('../controller/automation');

router.get("/instagram", AutomationController.automate_instagram);


module.exports = router;