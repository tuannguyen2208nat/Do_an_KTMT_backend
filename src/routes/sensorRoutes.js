const express = require('express');
const SensorRoutes = express.Router();
const SensorController = require('../controllers/sensorController');

SensorRoutes.route('/set/:type')
    .post((req, res) => {
        const { type } = req.params;
        if (type === 'temp') {
            SensorController.setTemp(req, res);
        } else if (type === 'humi') {
            SensorController.setHumi(req, res);
        } else if (type === 'location') {
            SensorController.setLocation(req, res);
        } else {
            res.status(400).send('Invalid type');
        }
    });

SensorRoutes.route('/get/:type')
    .get((req, res) => {
        const { type } = req.params;
        if (type === 'temp') {
            SensorController.getTemp(req, res);
        } else if (type === 'humi') {
            SensorController.getHumi(req, res);
        } else if (type === 'location') {
            SensorController.getLocation(req, res);
        } else {
            res.status(400).send('Invalid type');
        }
    });

module.exports = SensorRoutes;
