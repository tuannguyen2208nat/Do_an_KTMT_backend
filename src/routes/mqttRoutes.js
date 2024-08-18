var express = require('express');
var mqttRoutes = express.Router();
const mqttController = require('../controllers/mqttController');
const authenticateToken = require('../middlewares/authenticateToken');

mqttRoutes.get('/connect', authenticateToken, mqttController.connect);

mqttRoutes.get('/disconect', authenticateToken, mqttController.disconect);

module.exports = mqttRoutes;
