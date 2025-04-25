const express = require("express");
const router = express.Router();
const conceptualConsistencyController = require("../controllers/conceptualConsistencyController");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

// Route for Latitude-Longitude & State Validation
router.post("/lat-lon-state/upload", upload.single("file"), conceptualConsistencyController.validateLatLonState);

// Route for State & District Validation
router.post("/state-district/upload", upload.single("file"), conceptualConsistencyController.validateStateDistrict);

// Route for Pincode & District Validation
router.post("/pincode-district/upload", upload.single("file"), conceptualConsistencyController.validatePincodeDistrict);


router.post("/save-log", conceptualConsistencyController.saveLog);
router.get("/fetch-logs", conceptualConsistencyController.fetchLogs);

module.exports = router;
