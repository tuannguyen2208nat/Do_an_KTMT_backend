var express = require('express');
var ProfileRouter = express.Router();
const Usercontroller = require('../controllers/userController');
const upload = require('../middlewares/uploadMiddleware');

ProfileRouter.patch('/edit', upload.single('avatar'), Usercontroller.edit_profile);
ProfileRouter.get('/', Usercontroller.get_profile);

module.exports = ProfileRouter;
