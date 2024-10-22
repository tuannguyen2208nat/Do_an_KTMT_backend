const express = require('express');
const SensorRoutes = express.Router();
const SensorController = require('../controllers/sensorController');
const IpMiddleware = require('../middlewares/IpMiddleware');

SensorRoutes.patch('/set/temp', IpMiddleware('set temp'), SensorController.setTemp);
SensorRoutes.patch('/set/humi', IpMiddleware('set humi'), SensorController.setHumi);
SensorRoutes.patch('/set/location', IpMiddleware('set location'), SensorController.setLocation);

SensorRoutes.get('/get/temp', IpMiddleware('get temp'), SensorController.getTemp);
SensorRoutes.get('/get/humi', IpMiddleware('get humi'), SensorController.getHumi);
SensorRoutes.get('/get/location', IpMiddleware('get location'), SensorController.getLocation);

module.exports = SensorRoutes;
