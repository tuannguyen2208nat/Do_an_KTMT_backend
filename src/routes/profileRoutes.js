var express = require('express');
var ProfileRouter = express.Router();
const Usercontroller = require('../controllers/userController');
const upload = require('../middlewares/uploadMiddleware');
const mqttController = require('../connect/mqttController')

ProfileRouter.patch('/edit', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), Usercontroller.edit_profile, mqttController.reconnectMqtt);
ProfileRouter.get('/', Usercontroller.get_profile);

module.exports = ProfileRouter;
