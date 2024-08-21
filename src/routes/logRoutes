var express = require('express');
var LogRouter = express.Router();
var LogController = require('../controllers/logController');

LogRouter.get('/temp', LogController.getTemp);
LogRouter.get('/humi', LogController.getHumi);

module.exports = LogRouter;