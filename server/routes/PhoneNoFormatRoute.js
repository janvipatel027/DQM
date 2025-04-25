const PincodeformateControllers = require('../controllers/phoneNoFormatController');
const express = require('express');
const router = express.Router();

router.post('/phone-auto', PincodeformateControllers.phoneAuto);
router.get('/phone-log',PincodeformateControllers.getPhoneLogs);
router.post('/phone-log', PincodeformateControllers.createPhoneLogs);
module.exports = router;