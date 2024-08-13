var express = require('express');
var router = express.Router();
const Transporter = require('../config/mail');

router.post('/test', function (req, res, next) {
    const mailOptions = {
        from: 'mailrac467@gmail.com',
        to: 'dodaihockhoia@gmail.com',
        subject: 'Test send mail',
        text: 'Hello, this is a test email',
    };
    Transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            res.status(500).json({
                message: 'Server error',
                error: error.message,
            });
        } else {
            res.status(200).json({
                message: 'Send mail success',
                info: info.response,
            });
        }
    });
});
module.exports = router;
