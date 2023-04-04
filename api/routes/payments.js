const express = require("express");
const router = express.Router();
const PaymentsController = require('../controller/payments');
const checkAuth = require("../middleware/check-auth");

router.post("/premium/generatelink", checkAuth, PaymentsController.prem_generate_link);
router.post("/premium/generatetestinglink", checkAuth, PaymentsController.prem_generate_testing_link);

router.post("/premium/status", checkAuth, PaymentsController.prem_status);



module.exports = router;
