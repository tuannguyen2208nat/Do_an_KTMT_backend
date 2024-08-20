const modelUser = require('../models/Users');

const isEmail = (str) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
};

const parseEmailOrUsername = async (req, res, next) => {
    const { emailOrusername, email } = req.body;
    if (email) {
        req.email = email;
        return next();
    }

    if (!emailOrusername) {
        return res.status(400).json({ error: 'emailOrusername is required' });
    }

    if (isEmail(emailOrusername)) {
        req.email = emailOrusername;
    } else {
        const username = emailOrusername;
        const user = await modelUser.findOne({ username }).exec();
        if (!user) {
            return res.status(404).json({ error: 'Invalid user' });
        }
        req.email = user.email;
    }

    next();
};

module.exports = parseEmailOrUsername;
