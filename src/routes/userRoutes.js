var express = require('express');
var UserRouter = express.Router();
const Usercontroller = require('../controllers/userController');
const refreshToken = require('../middlewares/refreshToken');
const authenticateToken = require('../middlewares/authenticateToken');
const profileRoutes = require('./profileRoutes');

UserRouter.post('/login', Usercontroller.login);

UserRouter.post('/register', Usercontroller.register);

UserRouter.get('/logout', authenticateToken, Usercontroller.logout);

UserRouter.use('/profile', authenticateToken, profileRoutes);

UserRouter.post('/refresh-token', refreshToken);

module.exports = UserRouter;
