var express = require('express');
var WsvRoutes = express.Router();
const wsvController = require('../controllers/wsvController');

WsvRoutes.get('/connect', wsvController.connect);

WsvRoutes.get('/publishdata', wsvController.publishdata);

WsvRoutes.get('/disconnect', wsvController.disconnect);

module.exports = WsvRoutes;
