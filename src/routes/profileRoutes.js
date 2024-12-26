var express = require('express');
var ProfileRouter = express.Router();
const Usercontroller = require('../controllers/userController');
const upload = require('../middlewares/uploadMiddleware');
const mqttController = require('../connect/mqttController')
const IpMiddleware = require('../middlewares/IpMiddleware');

ProfileRouter.patch('/edit', IpMiddleware('edit profile'), upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), Usercontroller.edit_profile, mqttController.reconnectMqtt);
ProfileRouter.delete('/delete', IpMiddleware('delete profile'), mqttController.disconnectMqtt, Usercontroller.delete_profile)
ProfileRouter.get('/', IpMiddleware('get profile'), Usercontroller.get_profile);

module.exports = ProfileRouter;
