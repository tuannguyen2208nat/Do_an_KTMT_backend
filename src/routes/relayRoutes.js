var express = require('express');
var RelayRoutes = express.Router();
const relayController = require('../controllers/relayController');
const logController = require('../controllers/logController');

RelayRoutes.post('/add', relayController.add_relay, logController.setLog);
RelayRoutes.get('/get', relayController.get_relay);
RelayRoutes.patch('/set', relayController.set_relay, logController.setLog);
RelayRoutes.delete('/delete', relayController.delete_relay, logController.setLog);
RelayRoutes.patch('/set-status', relayController.set_status, logController.setLog);
RelayRoutes.get('/get-status', relayController.get_status);

module.exports = RelayRoutes;