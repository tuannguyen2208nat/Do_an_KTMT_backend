var express = require('express');
var SettingRoutes = express.Router();
const settingController = require('../controllers/settingController');

SettingRoutes.post('/add', settingController.add_setting);
SettingRoutes.patch('/set', settingController.set_setting);
SettingRoutes.get('/get', settingController.get_setting);

module.exports = SettingRoutes;
