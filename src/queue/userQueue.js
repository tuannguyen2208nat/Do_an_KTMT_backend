const Queue = require('bull');
const User = require('../models/Users');

const userQueue = new Queue('userQueue', {
    redis: {
        host: '127.0.0.1',
        port: 6379,
    },
});

userQueue.process(async (job) => {
    const { userID, data, date } = job.data;
    try {
        const user = await User.findById(userID);
        const email = user.email;
        user.webServerIp = data;
        await user.save();
    }
    catch (error) {
        throw new Error(error);
    }
});

module.exports = userQueue;
