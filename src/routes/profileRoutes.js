var express = require('express');
var ProfileRouter = express.Router();
const Usercontroller = require('../controllers/userController');

ProfileRouter.patch('/edit', Usercontroller.edit_profile);
ProfileRouter.get('/', Usercontroller.get_profile);

module.exports = ProfileRouter;
