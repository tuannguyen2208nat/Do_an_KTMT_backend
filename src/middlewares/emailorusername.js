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
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    if (isEmail(emailOrusername)) {
        req.email = emailOrusername;
    } else {
        const username = emailOrusername;
        const user = await modelUser.findOne({ username }).exec();
        if (!user) {
            return res.status(404).json({ error: 'Invalid username or password' });
        }
        req.email = user.email;
    }
    return next();
};

module.exports = parseEmailOrUsername;
