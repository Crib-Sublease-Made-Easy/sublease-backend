const express = require("express");
const router = express.Router();
const AutocompleteController = require('../controller/autocomplete');

router.get("/places/:query", AutocompleteController.places_autocomplete);
router.get("/places/", AutocompleteController.places_autocomplete);
router.get("/reversegeocoding", AutocompleteController.reverse_geocoding);
router.get("/geocoding", AutocompleteController.geocoding);
router.get("/geocoding_all", AutocompleteController.geocoding_all);


module.exports = router;
