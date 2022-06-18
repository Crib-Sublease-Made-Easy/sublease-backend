const express = require("express");
const router = express.Router();

const PropertyController = require('../controller/properties');
const checkAuth = require('../middleware/check-auth');

router.post("/", PropertyController.property_create);
router.get("/", PropertyController.property_get_all);
router.get("/:id", checkAuth, PropertyController.property_get_one);
router.put("/:id", checkAuth, PropertyController.property_modify);
router.get("/:id", checkAuth, PropertyController.property_delete);

module.exports = router;