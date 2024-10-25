var express = require('express');
var UserRouter = express.Router();
const Usercontroller = require('../controllers/userController');
const profileRoutes = require('./profileRoutes');
const refreshToken = require('../middlewares/refreshToken');
const authenticateToken = require('../middlewares/authenticateToken');
const emailorusername = require('../middlewares/emailorusername');
const mqttController = require('../connect/mqttController')


UserRouter.post('/login', emailorusername, Usercontroller.login);
UserRouter.post('/register', Usercontroller.register, mqttController.newconnect);
UserRouter.patch('/forgot-password', emailorusername, Usercontroller.forgot_password);
UserRouter.get('/logout', authenticateToken, Usercontroller.logout);
UserRouter.use('/profile', authenticateToken, profileRoutes);
UserRouter.get('/verify-token', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'Token is valid', user: req.user });
});
UserRouter.post('/refresh-token', refreshToken);

module.exports = UserRouter;
