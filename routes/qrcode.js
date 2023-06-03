'use strict';
const express = require('express');
const router = express.Router();
var qrCodeHandlers = require('../controllers/qrcode');
router.post('/generate', qrCodeHandlers.generate);
router.post('/scan', qrCodeHandlers.scan);
module.exports = router;