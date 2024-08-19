const express = require('express');
const router = express.Router();

const usersRouter = require('./userRoutes');
const sensorRoutes = require('./sensorRoutes');
const mqttRoutes = require('./mqttRoutes');
const emailRoutes = require('./emailRoutes');

router.use('/', usersRouter);
router.use('/sensor', sensorRoutes);
router.use('/mqtt', mqttRoutes);
router.use('/email', emailRoutes);

module.exports = router;
