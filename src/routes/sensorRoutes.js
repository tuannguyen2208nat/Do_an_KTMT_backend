var express = require('express');
var SensorRoutes = express.Router();
const Sensorcontroller = require('../controllers/sensorController');
const authenticateToken = require('../middlewares/authenticateToken');

SensorRoutes.get('/temp', authenticateToken, Sensorcontroller.getTemp);

SensorRoutes.get('/humi', authenticateToken, Sensorcontroller.getHumi);

SensorRoutes.get('/location', authenticateToken, Sensorcontroller.getLocation);

module.exports = SensorRoutes;
