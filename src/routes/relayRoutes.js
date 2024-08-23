var express = require('express');
var RelayRoutes = express.Router();
const relayController = require('../controllers/relayController');
const logController = require('../controllers/logController');
const { publishdata } = require('../controllers/mqttController');

RelayRoutes.post('/add', relayController.add_relay, logController.setLog);
RelayRoutes.get('/get', relayController.get_relay);
RelayRoutes.patch('/set', relayController.set_relay, logController.setLog);
RelayRoutes.delete('/delete', relayController.delete_relay, logController.setLog);
RelayRoutes.patch('/set-status', relayController.set_status, publishdata, logController.setLog);

module.exports = RelayRoutes;