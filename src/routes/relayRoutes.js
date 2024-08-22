var express = require('express');
var RelayRoutes = express.Router();
const relayController = require('../controllers/relayController');
const logController = require('../controllers/logController');

RelayRoutes.post('/add', relayController.add_relay, logController.setLog);
RelayRoutes.get('/get', relayController.get_relay, logController.setLog);
RelayRoutes.patch('/set', relayController.set_relay, logController.setLog);
RelayRoutes.delete('/delete', relayController.delete_relay, logController.setLog);
RelayRoutes.get('/set-status', relayController.set_status, logController.setLog);
RelayRoutes.get('/get-status', relayController.get_status, logController.setLog);

module.exports = RelayRoutes;