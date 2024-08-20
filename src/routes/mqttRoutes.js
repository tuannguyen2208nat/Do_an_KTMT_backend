var express = require('express');
var mqttRoutes = express.Router();
const mqttController = require('../controllers/mqttController');
const authenticateToken = require('../middlewares/authenticateToken');

mqttRoutes.get('/connect', authenticateToken, mqttController.connect);

mqttRoutes.get('/publishdata', authenticateToken, mqttController.publishdata);

mqttRoutes.get('/disconect', mqttController.disconnect);

module.exports = mqttRoutes;
