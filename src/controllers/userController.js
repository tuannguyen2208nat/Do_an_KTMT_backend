require('dotenv').config();
const bcrypt = require('bcrypt');
const modelUser = require('../models/Users');
const JWT = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: 'Username and password are required.',
            });
        }

        const user = await modelUser.findOne({ username });

        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    message: 'Invalid username or password',
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
                userId: user._id,
                accessToken,
                refreshToken
            });
        } else {
            return res.status(401).json({
                message: 'Invalid username or password',
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'An error occurred',
            error: error.message,
        });
    }
};

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Username, email, and password are required.',
            });
        }

        const existingUser = await modelUser.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'Email or username already exists.',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new modelUser({
            username,
            email,
            password: hashedPassword
        });

        const result = await newUser.save();

        res.status(200).json({
            message: 'User registered successfully',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports = { login, register };
