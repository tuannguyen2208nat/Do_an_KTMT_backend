var express = require('express');
var ConnectRoutes = express.Router();
const connectController = require('../controllers/connectController');

ConnectRoutes.patch('/publishdata', connectController.publishdata);
ConnectRoutes.get('/disconnect', connectController.disconnect);
ConnectRoutes.post('/', connectController.connect, (req, res) => { req.controller.connect(req, res); });

module.exports = ConnectRoutes;