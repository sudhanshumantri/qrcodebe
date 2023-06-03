'use strict';
const express = require('express');
const router = express.Router();
const multer = require('multer')
var qrCodeHandlers = require('../controllers/qrcode');
var path = require("path")
// var storage = multer.memoryStorage({
//     destination: function (req, file, callback) {
//         callback(null,"/uploads/");
//     }, filename: function (req, file, cb) {
//         cb(null, file.originalname)
//     }
// })
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
      callBack(null, './uploads/')
    },
    filename: (req, file, callBack) => {
      callBack(
        null,
        file.fieldname + '-' + Date.now() + path.extname(file.originalname),
      )
    },
  })
var uploads = multer({ storage: storage })
router.post('/uploadcsv',uploads.single('uploadcsv'),qrCodeHandlers.generate);
router.post('/scan', qrCodeHandlers.scan);
router.post('/ok', qrCodeHandlers.ok);

module.exports = router;