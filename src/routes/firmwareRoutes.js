var express = require('express');
var FirmwareRouter = express.Router();
const firmwareController = require('../controllers/firmwareController');
const upload = require('../middlewares/uploadMiddleware');

FirmwareRouter.post('/upload', upload.single('file'), firmwareController.upload);
FirmwareRouter.post('/download', firmwareController.downloadFile);
FirmwareRouter.post('/get', firmwareController.getVersions);

module.exports = FirmwareRouter;