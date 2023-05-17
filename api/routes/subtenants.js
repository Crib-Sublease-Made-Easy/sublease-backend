const express = require("express");
const router = express.Router();
const SubtenantController = require("../controller/subtenants");

router.post("/create", SubtenantController.create)
router.post("/getone", SubtenantController.get_one)

//used to add subtenant to the tenant cribConnectSubtenants
router.post("/addsubtoten", SubtenantController.add_subtenant_to_tenant)
router.put("/clearsubarray", SubtenantController.clear_array)
router.get("/messageSubtenantAvail", SubtenantController.message_subtenant_avail)
module.exports = router;