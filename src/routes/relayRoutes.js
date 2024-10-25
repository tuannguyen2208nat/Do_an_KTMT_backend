var express = require('express');
var RelayRoutes = express.Router();
const relayController = require('../controllers/relayController');
const logController = require('../controllers/logController');
const IpMiddleware = require('../middlewares/IpMiddleware');
const MQTTController = require('../connect/mqttController');

RelayRoutes.post('/add', IpMiddleware('add relay'), relayController.add_relay, logController.setLog);
RelayRoutes.get('/get', IpMiddleware('get relay'), relayController.get_relay);
RelayRoutes.patch('/set', IpMiddleware('set relay'), relayController.set_relay, logController.setLog);
RelayRoutes.delete('/delete', IpMiddleware('delete relay'), relayController.delete_relay, logController.setLog);
RelayRoutes.patch('/set-status', IpMiddleware('set status relay'), relayController.set_status, MQTTController.publishdata, logController.setLog);
RelayRoutes.patch('/set-home', IpMiddleware('set home for relay'), relayController.set_relay_home, logController.setLog);
RelayRoutes.get('/get-home', IpMiddleware('get relays home'), relayController.get_relay_home);

module.exports = RelayRoutes;