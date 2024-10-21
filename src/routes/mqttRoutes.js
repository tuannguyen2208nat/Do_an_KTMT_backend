var express = require('express');
var MQTTRouter = express.Router();
var MQTTController = require('../connect/mqttController');

MQTTRouter.post('/reconnect', MQTTController.reconnectMqtt);

module.exports = MQTTRouter;