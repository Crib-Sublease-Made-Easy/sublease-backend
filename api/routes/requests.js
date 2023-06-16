const express = require("express");
const router = express.Router();
const RequestController = require('../controller/requests');
const checkAuth = require('../middleware/check-auth');


router.post("/", checkAuth, RequestController.requests_create);
router.put("/accepted", checkAuth, RequestController.requests_accepted);
router.delete("/:id", checkAuth, RequestController.request_delete);
router.get("/myrequests", checkAuth, RequestController.request_retrievemyrequests);
router.get("/myreceivedrequests", checkAuth, RequestController.request_retrievemyreceivedrequests);
router.post("/requestesignature", checkAuth, RequestController.request_esignature);
router.get("/contract/signedStatus/:envelope_id", checkAuth, RequestController.signed_status);


module.exports = router; 