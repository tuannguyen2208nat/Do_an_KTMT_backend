var express = require('express');
var ScheduleRoutes = express.Router();
const scheduleController = require('../controllers/scheduleController');
const logController = require('../controllers/logController');

ScheduleRoutes.post('/add', scheduleController.add_schedule, logController.setLog);
ScheduleRoutes.get('/get', scheduleController.get_schedule);
ScheduleRoutes.patch('/set', scheduleController.set_schedule, logController.setLog);
ScheduleRoutes.delete('/delete', scheduleController.delete_schedule, logController.setLog);
ScheduleRoutes.patch('/set-status', scheduleController.set_status, logController.setLog);

module.exports = ScheduleRoutes;