var express = require('express');
var mqttRoutes = express.Router();
const mqttController = require('../controllers/mqttController');
const authenticateToken = require('../middlewares/authenticateToken');

mqttRoutes.get('/connect', mqttController.connect);

mqttRoutes.get('/publishdata', mqttController.publishdata);

mqttRoutes.get('/disconnect', mqttController.disconnect);

module.exports = mqttRoutes;
