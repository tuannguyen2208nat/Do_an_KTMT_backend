var express = require('express');
var UserRouter = express.Router();
const bcrypt = require('bcrypt');
const modelUser = require('../models/Users');
const JWT = require('jsonwebtoken');
const SECRET_KEY = "Namnv"

// Login user
UserRouter.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: 'Username and password are required.'
            });
        }

        // Tìm người dùng bằng username
        const user = await modelUser.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            // Tạo JWT token
            const token = JWT.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
            const refreshToken = JWT.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1d' });

            // Gửi thông tin người dùng và token lên frontend
            res.json({
                status: 200,
                message: 'Đăng nhập thành công',
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                },
                token: token,
                refreshToken: refreshToken
            });
        } else {
            res.status(401).json({
                message: 'Invalid username or password'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'An error occurred',
            error: error.message
        });
    }
});

// Register user
UserRouter.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Username, email, and password are required.'
            });
        }
        const existingUser = await modelUser.findOne({ $or: [{ email: email }, { username: username }] });
        if (existingUser) {
            return res.status(400).json({
                message: 'Email or username already exists.'
            });
        }
        const newUser = new modelUser(req.body);
        const result = await newUser.save();
        res.json({
            status: 200,
            message: 'User registered successfully',
            data: result
        });

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});



module.exports = UserRouter;
