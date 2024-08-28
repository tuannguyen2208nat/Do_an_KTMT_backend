var express = require('express');
var RelayRoutes = express.Router();
const relayController = require('../controllers/relayController');
const logController = require('../controllers/logController');

RelayRoutes.post('/add', relayController.add_relay, logController.setLog);
RelayRoutes.get('/get', relayController.get_relay);
RelayRoutes.patch('/set', relayController.set_relay, logController.setLog);
RelayRoutes.delete('/delete', relayController.delete_relay, logController.setLog);
RelayRoutes.patch('/set-status', relayController.set_status, (req, res, next) => { req.controller.publishdata(req, res, next); }, logController.setLog);
RelayRoutes.patch('/set-home', relayController.set_relay_home, logController.setLog);
RelayRoutes.get('/get-home', relayController.get_relay_home);

module.exports = RelayRoutes;