const express = require('express');
const multer = require('multer');
const router = express.Router();
// const relativePositionAccController = require('../controllers/relativePositionAccController');
const relativePositionAccController = require('../controllers/PositionalAccControllers/relativePositionAccController');

const cors = require('cors');
const path = require('path');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'frontend/build')));


// API to upload Excel file and calculate distances between all unique pairs of points
router.post('/upload', upload.single('file'), relativePositionAccController.uploadRelativeAcc);


// Endpoint to save data to the database
router.post('/save',relativePositionAccController.saveRelativeAcc);


// Endpoint to retrieve entries (for grid functionality)
router.get('/getEntries', relativePositionAccController.getEntriesRelativeAcc);


// Endpoint to retrieve distances for a specific entry
router.get('/getDistances/:entryId', relativePositionAccController.getDistancesRelativeAcc);


// Endpoint to download distances as CSV
router.get('/downloadDistances/:entryId', relativePositionAccController.downloadDistanceRelativeAcc);


module.exports = router;