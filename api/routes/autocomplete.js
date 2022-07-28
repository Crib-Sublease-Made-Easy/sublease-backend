const express = require("express");
const router = express.Router();
const AutocompleteController = require('../controller/autocomplete');

router.get("/places/:query", AutocompleteController.places_autocomplete);
router.get("/places/", AutocompleteController.places_autocomplete);

module.exports = router;