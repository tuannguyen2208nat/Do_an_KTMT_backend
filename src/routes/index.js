const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');

const usersRouter = require('./userRoutes');
const sensorRoutes = require('./sensorRoutes');
const emailRoutes = require('./emailRoutes');
const logRoutes = require('./logRoutes');
const relayRoutes = require('./relayRoutes');
const settingRoutes = require('./settingRoutes');
const connectRoutes = require('./connectRoutes');

router.use('/', usersRouter);
router.use('/connect', authenticateToken, connectRoutes);
router.use('/sensor', authenticateToken, sensorRoutes);
router.use('/email', emailRoutes);
router.use('/log', authenticateToken, logRoutes);
router.use('/relay', authenticateToken, relayRoutes);
router.use('/setting', authenticateToken, settingRoutes);

module.exports = router;
