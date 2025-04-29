const phoneNoFormatController = require('../controllers/phoneNoFormatController');
const express = require('express');
const router = express.Router();

router.post('/phone-auto', phoneNoFormatController.phoneAuto);
router.get('/phone-log',phoneNoFormatController.getPhoneLogs);
router.post('/phone-log', phoneNoFormatController.createPhoneLogs);
module.exports = router;