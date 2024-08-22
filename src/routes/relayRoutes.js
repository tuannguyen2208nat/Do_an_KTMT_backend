var express = require('express');
var RelayRoutes = express.Router();
const relayController = require('../controllers/relayController');
const logController = require('../controllers/logController');

RelayRoutes.post('/add-relay', relayController.add_relay, logController.setLog);
RelayRoutes.get('/get-relay', relayController.get_relay, logController.setLog);
RelayRoutes.patch('/set-relay', relayController.set_relay, logController.setLog);
RelayRoutes.delete('/delete-relay', relayController.delete_relay, logController.setLog);

module.exports = RelayRoutes;