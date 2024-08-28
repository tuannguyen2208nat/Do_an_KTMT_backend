var express = require('express');
var UserRouter = express.Router();
const Usercontroller = require('../controllers/userController');
const profileRoutes = require('./profileRoutes');
const refreshToken = require('../middlewares/refreshToken');
const authenticateToken = require('../middlewares/authenticateToken');
const emailorusername = require('../middlewares/emailorusername');

UserRouter.post('/login', emailorusername, Usercontroller.login);

UserRouter.post('/register', Usercontroller.register);

UserRouter.patch('/forgot-password', emailorusername, Usercontroller.forgot_password);

UserRouter.get('/logout', authenticateToken, Usercontroller.logout);

UserRouter.use('/profile', authenticateToken, profileRoutes);

UserRouter.post('/refresh-token', refreshToken);

module.exports = UserRouter;
