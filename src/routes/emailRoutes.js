var express = require('express');
var emailRoutes = express.Router();
const emailController = require('../controllers/emailController');
const emailorusername = require('../middlewares/emailorusername');

emailRoutes.post('/send-code', emailorusername, emailController.send_code);
emailRoutes.post('/confirm-code', emailorusername, emailController.confirm_code);

module.exports = emailRoutes;
