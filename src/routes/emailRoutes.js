var express = require('express');
var emailRoutes = express.Router();
const emailController = require('../controllers/emailController');
const authenticateToken = require('../middlewares/authenticateToken');

emailRoutes.post('/register', emailController.verify_code_register);
emailRoutes.post('/forgot-password', emailController.verify_code_forgot_password);
emailRoutes.post('/change-password', authenticateToken, emailController.verify_code_change_password);

module.exports = emailRoutes;
