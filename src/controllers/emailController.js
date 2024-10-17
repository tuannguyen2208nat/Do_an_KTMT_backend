require('dotenv').config();
const crypto = require('crypto');
const Transporter = require('../config/email');
const modelUser = require('../models/Users');
const emailQueue = require('../queue/emailQueue');

const verificationCodes = {};

const generateVerificationCode = () => {
    return crypto.randomBytes(3).toString('hex');
};

const send_code = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                error: 'Email is required.',
            });
        }
        const code = generateVerificationCode();
        verificationCodes[email] = {
            code: code,
            expiry: Date.now() + 300000
        };
        const subject = 'Verification code';
        const text = `Your verification code is ${code}`;
        emailQueue.add({ email, subject, text });
        res.status(200).json({
            message: 'Verification code sent successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Server error',
        });
    }
}

const confirm_code = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        if (!email || !verificationCode) {
            return res.status(400).json({
                error: 'Email and code are required.',
            });
        }
        const storedCode = verificationCodes[email];
        if (storedCode && storedCode.code === verificationCode) {
            if (Date.now() > storedCode.expiry) {
                delete verificationCodes[email];
                return res.status(400).json({
                    error: 'Verification code has expired.',
                });
            }
            delete verificationCodes[email];
            return res.status(200).json({
                message: 'Verification successful.',
            });
        } else {
            return res.status(400).json({
                error: 'Invalid verification code.',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            error: 'Server error',
        });
    }
}

module.exports = {
    send_code,
    confirm_code,
};