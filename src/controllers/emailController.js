require('dotenv').config();
const crypto = require('crypto');
const Transporter = require('../config/email');
const modelUser = require('../models/Users');

const verificationCodes = {};

const generateVerificationCode = () => {
    return crypto.randomBytes(3).toString('hex');
};

const sendVerificationCode = async (email, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        text: text,
    };
    await Transporter.sendMail(mailOptions);
}


const send_code = async (req, res) => {
    try {
        const { email } = req;
        if (!email) {
            return res.status(400).json({
                message: 'Email is required.',
            });
        }
        const code = generateVerificationCode();
        verificationCodes[email] = code;
        const subject = 'Verification code';
        const text = `Your verification code is ${code}`;
        await sendVerificationCode(email, subject, text);
        res.status(200).json({
            message: 'Verification code sent successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
}

const confirm_code = async (req, res) => {
    try {
        const { email } = req;
        const { verificationCode } = req.body;

        if (!email || !verificationCode) {
            return res.status(400).json({
                message: 'Email and code are required.',
            });
        }
        const storedCode = verificationCodes[email];
        if (storedCode === verificationCode) {
            delete verificationCodes[email];
            return res.status(200).json({
                message: 'Verification successful.',
            });
        } else {
            return res.status(400).json({
                message: 'Invalid verification code.',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
}

module.exports = {
    send_code,
    confirm_code,
};