var express = require('express');
var SensorRoutes = express.Router();
const Sensorcontroller = require('../controllers/sensorController');

SensorRoutes.get('/temp', Sensorcontroller.getTemp);

SensorRoutes.get('/humi', Sensorcontroller.getHumi);

SensorRoutes.get('/location', Sensorcontroller.getLocation);

module.exports = SensorRoutes;
