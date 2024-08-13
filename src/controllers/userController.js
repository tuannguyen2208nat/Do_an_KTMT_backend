const modelUser = require('../models/Users');
const JWT = require('jsonwebtoken');
const SECRET_KEY = 'Namnv';

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: 'Username and password are required.',
            });
        }
        const user = await modelUser.findOne({ username, password });
        if (user) {
            const token = JWT.sign({ id: user._id }, SECRET_KEY, {
                expiresIn: '1h',
            });
            const refreshToken = JWT.sign({ id: user._id }, SECRET_KEY, {
                expiresIn: '1d',
            });
            return res.status(200).json({
                message: 'Login successful',
                token: token,
                refreshToken: refreshToken,
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
            $or: [{ email: email }, { username: username }],
        });
        if (existingUser) {
            return res.status(400).json({
                message: 'Email or username already exists.',
            });
        }
        const newUser = new modelUser(req.body);
        const result = await newUser.save();
        res.json({
            status: 200,
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
