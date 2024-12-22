require('dotenv').config();
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
//Model
const modelUser = require('../models/Users');
const Relay = require('../models/Relay');
const HumiditySensors = require('../models/HumiditySensors');
const TemperatureSensors = require('../models/TemperatureSensors');
const Location = require('../models/Location');
const Schedule = require('../models/Schedule');

const login = async (req, res) => {
    try {
        const { email } = req;
        const { password } = req.body;

        const user = await modelUser.findOne({ email }).select('+password').lean().exec();
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const accessToken = JWT.sign({ id: user._id }, process.env.accessTokenSecret, { expiresIn: '1h' });
        const refreshToken = JWT.sign({ id: user._id }, process.env.refreshTokenSecret, { expiresIn: '7d' });

        await modelUser.updateOne({ _id: user._id }, { refreshToken });

        const dayOfWeek = new Date().getDay();
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const day = daysOfWeek[dayOfWeek];

        const userID = user._id;
        const [relays, relays_home, latestTemp, latestHumi, latestLocation, schedules, schedules_home] = await Promise.all([
            Relay.find({ userID }).lean(),
            Relay.find({ userID, relay_home: true }).lean(),
            TemperatureSensors.findOne({ userID }).sort({ Date: -1 }).select('data').lean().exec(),
            HumiditySensors.findOne({ userID }).sort({ Date: -1 }).select('data').lean().exec(),
            Location.findOne({ userID }).sort({ Date: -1 }).select('X Y').lean().exec(),
            Schedule.find({ userID }).lean(),
            Schedule.find({ userID, day: { $in: day } }).lean()
        ]);

        if (latestLocation) {
            latestLocation["data"] = `${latestLocation.X}-${latestLocation.Y}`;
            delete latestLocation.X;
            delete latestLocation.Y;
        }

        const temperature = latestTemp?.data || 0.0;
        const humidity = latestHumi?.data || 0.0;
        const location = latestLocation?.data || "10.7736288-106.6602627";

        const { password: _, ...userProfile } = user;

        return res.status(200).json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            temperature,
            humidity,
            location,
            relays,
            relays_home,
            profile: userProfile,
            schedules,
            schedules_home,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};


const register = async (req, res, next) => {
    try {
        const { username, email, password, aioUser, aioKey, phone } = req.body;
        if (!username || !email || !password || !aioUser || !aioKey || !phone) {
            return res.status(400).json({
                message: 'Username, email, password ,phone, AIO_USERNAME and AIO_KEY are required.',
            });
        }
        const existingUser = await modelUser.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'Email or username already exists.',
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            error: 'Server error'
        });
    }
};

const logout = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await modelUser.findById(userId).exec();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.refreshToken = '';
        await user.save();
        return res.status(200).json({
            message: 'Logout successfully',
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Server error',
        });
    }
}

const get_profile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await modelUser.findById(userId).exec();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userProfile = user.toObject();
        delete userProfile.password;
        return res.status(200).json({
            message: 'Profile retrieved successfully',
            data: userProfile,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Server error',
        });
    }
}

const edit_profile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await modelUser.findById(userId).exec();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { username, fullname, email, newpassword, phone_number, AIO_USERNAME, AIO_KEY, webServerIp, currentpassword } = req.body;

        if (!username && !fullname && !email && !newpassword && !phone_number && !AIO_USERNAME && !AIO_KEY && !webServerIp) {
            return res.status(400).json({ error: 'No data provided to update.' });
        }

        if (!currentpassword) {
            return res.status(400).json({
                error: 'Current password  are required.',
            });
        }

        if (newpassword && newpassword.length < 8) {
            return res.status(400).json({
                error: 'New password must be at least 8 characters long.',
            });
        }

        const isPasswordValid = await bcrypt.compare(currentpassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid current password.',
            });
        }

        if (username !== undefined) user.username = username;
        if (fullname !== undefined) user.fullname = fullname;
        if (email !== undefined) user.email = email;
        if (phone_number !== undefined) user.phone_number = phone_number;
        if (AIO_USERNAME !== undefined) user.AIO_USERNAME = AIO_USERNAME;
        if (AIO_KEY !== undefined) user.AIO_KEY = AIO_KEY;
        if (webServerIp !== undefined) user.webServerIp = webServerIp;

        if (newpassword) {
            const hashedPassword = await bcrypt.hash(newpassword, 10);
            user.password = hashedPassword;
        }
        if (req.files) {
            if (req.files['avatar']) {
                user.avatar = {
                    data: req.files['avatar'][0].buffer,
                    contentType: req.files['avatar'][0].mimetype
                };
            }
            if (req.files['coverPhoto']) {
                user.coverPhoto = {
                    data: req.files['coverPhoto'][0].buffer,
                    contentType: req.files['coverPhoto'][0].mimetype
                };
            }
        }
        if (!AIO_USERNAME && !AIO_KEY) {
            await user.save();
            const userProfile = user.toObject();
            delete userProfile.password;
            return res.status(200).json({
                message: 'Profile updated successfully',
                data: userProfile,
            });
        }
        req.case = 'edit_profile';
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};


const change_password = async (req, res) => {
    try {
        const { password, newpassword } = req.body;
        const userId = req.user.id;
        const user = await modelUser.findById(userId).exec();
        if (!password || !newpassword) {
            return res.status(400).json({
                error: 'Current password and new password are required.',
            });
        }

        if (!user) {
            return res.status(404).json({
                error: 'User not found.',
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid current password.',
            });
        }
        const hashedPassword = await bcrypt.hash(newpassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            message: 'Password changed successfully.',
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Server error',
        });
    }
}

const forgot_password = async (req, res) => {
    try {
        const { email } = req;
        const { newPassword } = req.body;
        const user = await modelUser.findOne({ email });
        if (!user) {
            return res.status(404).json({
                error: 'User not found.',
            });
        }
        if (newPassword && newPassword.length < 8) {
            return res.status(400).json({
                error: 'New password must be at least 8 characters long.',
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({
            message: 'Password changed successfully.',
        });

    }
    catch (error) {
        return res.status(500).json({
            error: 'Server error',
        });
    }
}


module.exports = { login, register, logout, get_profile, edit_profile, change_password, forgot_password };
