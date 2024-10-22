var express = require('express');
var LogRouter = express.Router();
var LogController = require('../controllers/logController');
const IpMiddleware = require('../middlewares/IpMiddleware');

LogRouter.post('/get', IpMiddleware('get history'), LogController.getLog);
LogRouter.post('/temp', IpMiddleware('get temp value for chart'), LogController.getTemp);
LogRouter.post('/humi', IpMiddleware('get humi value for chart'), LogController.getHumi);

module.exports = LogRouter;