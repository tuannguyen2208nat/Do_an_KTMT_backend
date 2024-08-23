var express = require('express');
var LogRouter = express.Router();
var LogController = require('../controllers/logController');

LogRouter.get('/get', LogController.getLog);
LogRouter.post('/temp', LogController.getTemp);
LogRouter.post('/humi', LogController.getHumi);

module.exports = LogRouter;