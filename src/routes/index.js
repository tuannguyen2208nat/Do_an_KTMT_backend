const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');

const usersRouter = require('./userRoutes');
const sensorRoutes = require('./sensorRoutes');
const mqttRoutes = require('./mqttRoutes');
const emailRoutes = require('./emailRoutes');
const logRoutes = require('./logRoutes');

router.use('/', usersRouter);
router.use('/sensor', authenticateToken, sensorRoutes);
router.use('/mqtt', authenticateToken, mqttRoutes);
router.use('/email', emailRoutes);
router.use('/log', authenticateToken, logRoutes);

module.exports = router;
