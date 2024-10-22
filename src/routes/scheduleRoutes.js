var express = require('express');
var ScheduleRoutes = express.Router();
const scheduleController = require('../controllers/scheduleController');
const logController = require('../controllers/logController');
const IpMiddleware = require('../middlewares/IpMiddleware');

ScheduleRoutes.post('/add', IpMiddleware('add schedule'), scheduleController.add_schedule, logController.setLog);
ScheduleRoutes.get('/get', IpMiddleware('get schedule'), scheduleController.get_schedule);
ScheduleRoutes.patch('/set', IpMiddleware('set schedule'), scheduleController.set_schedule, logController.setLog);
ScheduleRoutes.delete('/delete', IpMiddleware('delete schedule'), scheduleController.delete_schedule, logController.setLog);
ScheduleRoutes.patch('/set-status', IpMiddleware('set status schedule'), scheduleController.set_status, logController.setLog);

module.exports = ScheduleRoutes;