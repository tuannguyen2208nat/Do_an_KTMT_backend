var express = require('express');
var MqttRoutes = express.Router();
const mqttController = require('../controllers/mqttController');

MqttRoutes.get('/connect', mqttController.connect);

MqttRoutes.get('/publishdata', mqttController.publishdata);

MqttRoutes.get('/disconnect', mqttController.disconnect);

module.exports = MqttRoutes;
