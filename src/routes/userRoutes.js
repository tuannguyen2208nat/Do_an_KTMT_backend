var express = require('express');
var UserRouter = express.Router();
const Usercontroller = require('../controllers/userController');
const refreshToken = require('../middlewares/refreshToken');

UserRouter.post('/login', Usercontroller.login);

UserRouter.post('/register', Usercontroller.register);

UserRouter.post('/refresh-token', refreshToken);

module.exports = UserRouter;
