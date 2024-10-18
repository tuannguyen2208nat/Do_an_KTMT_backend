const Queue = require('bull');
const modelLog = require('../models/Log');

const logQueue = new Queue('logQueue', {
    redis: {
        host: '127.0.0.1',
        port: 6379,
    },
});

logQueue.process(async (job) => {
    const { userID, activity, date } = job.data;
    if (date === undefined) {
        date = new Date();
    }
    const newLog = new modelLog({
        userID: userID,
        activity,
        Date: date
    });
    try {
        await newLog.save();
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Log saving failed');
    }
});

module.exports = logQueue;
