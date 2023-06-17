const express = require("express");
const router = express.Router();
const PaymentsController = require('../controller/payments');
const checkAuth = require("../middleware/check-auth");

router.post("/premium/generatelink", checkAuth, PaymentsController.prem_generate_link);
router.post("/premium/generatetestinglink", checkAuth, PaymentsController.prem_generate_testing_link);
router.post("/premium/status", checkAuth, PaymentsController.prem_status);
router.post("/premium/getprice", PaymentsController.prem_get_price)
router.get("/premium/getCribConnectUserNumber", PaymentsController.prem_get_crib_connect_user_number)
router.get("/premium/cribConnectToalSaving", PaymentsController.prem_crib_connect_total_saving)
router.get("/premium/FAQ", PaymentsController.prem_FAQ)

//NEW ITERATION
router.post("/generate", PaymentsController.gen_link)




module.exports = router;
