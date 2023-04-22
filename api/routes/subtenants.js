const express = require("express");
const router = express.Router();
const SubtenantController = require("../controller/subtenants");

router.post("/create", SubtenantController.create)
router.post("/getone", SubtenantController.get_one)

module.exports = router;
