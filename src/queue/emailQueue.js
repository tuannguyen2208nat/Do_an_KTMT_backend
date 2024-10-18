const Queue = require('bull');
const Transporter = require('../config/email');

const emailQueue = new Queue('emailQueue', {
    redis: {
        host: '127.0.0.1',
        port: 6379
    }
});

emailQueue.process(async (job, done) => {
    const { email, subject, text } = job.data;

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        text: text,
    };

    try {
        await Transporter.sendMail(mailOptions);
        done();
    } catch (error) {
        console.error('Error sending email:', error);
        done(new Error('Email sending failed'));
    }
});

module.exports = emailQueue;
