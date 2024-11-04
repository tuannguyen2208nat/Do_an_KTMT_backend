var express = require('express');
var ProfileRouter = express.Router();
const firmwareController = require('../controllers/firmwareController');
const upload = require('../middlewares/uploadMiddleware');

ProfileRouter.post('/upload', upload.single('file'), firmwareController.upload);
ProfileRouter.post('/download', firmwareController.downloadFile);
ProfileRouter.get('/get', firmwareController.getVersions);

module.exports = ProfileRouter;