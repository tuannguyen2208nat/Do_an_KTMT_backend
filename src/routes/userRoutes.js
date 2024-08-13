var express = require('express');
var UserRouter = express.Router();
const Usercontroller = require('../controllers/userController');

UserRouter.post('/login', Usercontroller.login);

UserRouter.post('/register', Usercontroller.register);

module.exports = UserRouter;
