var express = require('express');
var emailRoutes = express.Router();
const emailController = require('../controllers/emailController');
const authenticateToken = require('../middlewares/authenticateToken');
const emailorusername = require('../middlewares/emailorusername');

emailRoutes.post('/send-code', emailorusername, emailController.send_code);
emailRoutes.post('/change-password', authenticateToken, emailController.change_password);
emailRoutes.post('/confirm-code', emailorusername, emailController.confirm_code);

module.exports = emailRoutes;
