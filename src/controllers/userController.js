require('dotenv').config();
const bcrypt = require('bcrypt');
const modelUser = require('../models/Users');
const JWT = require('jsonwebtoken');
const Transporter = require('../config/email');

const login = async (req, res) => {
    try {
        const { email } = req;
        const { password } = req.body;
        const user = await modelUser.findOne({ email });
        const username = user.username;

        if (!username || !password) {
            return res.status(400).json({
                error: 'Username and password are required.',
            });
        }

        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    error: 'Invalid username or password',
                });
            }

            const accessToken = JWT.sign({ id: user._id }, process.env.accessTokenSecret, {
                expiresIn: '1h',
            });
            const refreshToken = JWT.sign({ id: user._id }, process.env.refreshTokenSecret, {
                expiresIn: '7d',
            });

            user.refreshToken = refreshToken;

            await user.save();

            return res.status(200).json({
                message: 'Login successful',
                accessToken,
                refreshToken
            });
        } else {
            return res.status(401).json({
                error: 'Invalid username or password',
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Server error'
        });
    }
};

const register = async (req, res) => {
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

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new modelUser({
            username,
            email,
            password: hashedPassword,
            role: 'user',
            AIO_USERNAME: aioUser,
            AIO_KEY: aioKey,
            phone_number: phone,
        });

        const result = await newUser.save();

        if (result) {
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Registration successful',
                text: 'You have successfully registered to our platform',
            };
            await Transporter.sendMail(mailOptions)
            res.status(200).json({
                message: 'User registered successfully',
                data: result,
            });
        }
    } catch (error) {
        res.status(500).json({
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
        const { username, fullname, email, phone_number, AIO_USERNAME, AIO_KEY, webServerIp } = req.body;
        user.username = username;
        user.fullname = fullname;
        user.email = email;
        user.AIO_USERNAME = AIO_USERNAME;
        user.AIO_KEY = AIO_KEY;
        user.phone_number = phone_number;
        user.webServerIp = webServerIp;
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
        await user.save();
        req.case = 'true';
        next();
    } catch (error) {
        console.error('Error updating profile:', error);
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
