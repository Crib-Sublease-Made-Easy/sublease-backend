const express = require("express");
const router = express.Router();
const ContactController = require('../controller/contact');
const checkAuth = require('../middleware/check-auth');


router.post("/", checkAuth, ContactController.contact_us);

module.exports = router; 