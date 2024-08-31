const modelUser = require('../models/Users');

const checkRole = async (req, res, next) => {
    const userID = req.user.id;
    const user = await modelUser.findOne({ userID: userID });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    req.role = user.role;
    next();
}

module.exports = checkRole;