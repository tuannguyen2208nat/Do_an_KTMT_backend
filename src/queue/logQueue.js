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
        throw new Error(error);
    }
});

module.exports = logQueue;
