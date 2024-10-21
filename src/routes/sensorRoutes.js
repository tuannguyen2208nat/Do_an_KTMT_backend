const express = require('express');
const SensorRoutes = express.Router();
const SensorController = require('../controllers/sensorController');

SensorRoutes.patch('/set/temp', SensorController.setTemp);
SensorRoutes.patch('/set/humi', SensorController.setHumi);
SensorRoutes.patch('/set/location', SensorController.setLocation);

SensorRoutes.get('/get/temp', SensorController.getTemp);
SensorRoutes.get('/get/humi', SensorController.getHumi);
SensorRoutes.get('/get/location', SensorController.getLocation);

module.exports = SensorRoutes;
