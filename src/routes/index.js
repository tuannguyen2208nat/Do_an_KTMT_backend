const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');

const usersRouter = require('./userRoutes');
const sensorRoutes = require('./sensorRoutes');
const mqttRoutes = require('./mqttRoutes');
const WsvRoutes = require('./wsvRoutes');
const emailRoutes = require('./emailRoutes');
const logRoutes = require('./logRoutes');
const relayRoutes = require('./relayRoutes');

router.use('/', usersRouter);
router.use('/sensor', authenticateToken, sensorRoutes);
router.use('/mqtt', authenticateToken, mqttRoutes);
router.use('/wsv', authenticateToken, WsvRoutes);
router.use('/email', emailRoutes);
router.use('/log', authenticateToken, logRoutes);
router.use('/relay', authenticateToken, relayRoutes);

module.exports = router;
