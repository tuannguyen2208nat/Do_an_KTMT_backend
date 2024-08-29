var express = require('express');
var ConnectRoutes = express.Router();
const connectController = require('../controllers/connectController');

ConnectRoutes.get('/publishdata', connectController.publishdata, (req, res) => { req.controller.publishdata(req, res); });
ConnectRoutes.get('/disconnect', connectController.disconnect, (req, res) => { req.controller.disconnect(req, res); });
ConnectRoutes.post('/', connectController.connect, (req, res) => { req.controller.connect(req, res); });

module.exports = ConnectRoutes;