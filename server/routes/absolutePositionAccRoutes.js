const absolutePositionAccController = require('../controllers/PositionalAccControllers/absolutePositionAccController');
const express = require('express');

const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();
const router = express.Router();

const upload = multer({ dest: 'uploads/' });


app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'frontend/build')));




// API to upload Excel files and calculate Mean Positional Uncertainty and CE90
router.post('/upload', upload.array('files', 2), absolutePositionAccController.uploadAbsoluteAcc);


// Endpoint to save data to the database
router.post('/save', absolutePositionAccController.saveAbsoluteAcc);


// Endpoint to get entries with pagination
router.get('/getEntries', absolutePositionAccController.getEntriesAbsoluteAcc)


// Endpoint to get points for an entry
router.get('/getPoints/:entryId', absolutePositionAccController.getPointsAbsoluteAcc);


// Fetch stored data and generate a CSV file for download
router.get('/download/:entryId',absolutePositionAccController.downloadAbsoluteAcc);




module.exports = router;
