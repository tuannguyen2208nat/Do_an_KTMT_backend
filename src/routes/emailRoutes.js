var express = require('express');
var emailRoutes = express.Router();
const emailController = require('../controllers/emailController');
const authenticateToken = require('../middlewares/authenticateToken');

emailRoutes.get('/send-code', emailController.send_code);
emailRoutes.get('/change-password', authenticateToken, emailController.change_password);
emailRoutes.get('/confirm-code', emailController.confirm_code);

module.exports = emailRoutes;
