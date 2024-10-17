const Queue = require('bull');
const HumiditySensors = require('../models/HumiditySensors');
const TemperatureSensors = require('../models/TemperatureSensors');
const Location = require('../models/Location');

const sensorQueue = new Queue('sensorQueue', {
    redis: {
        host: '127.0.0.1',
        port: 6379,
    },
});

sensorQueue.process(async (job) => {
    const { userID, sensor, data, date } = job.data;
    try {
        switch (sensor) {
            case 'temperature':
                const tempData = new TemperatureSensors({
                    userID: userID,
                    data: data,
                    Date: date,
                });
                await tempData.save();
                break;

            case 'humidity':
                const humidityData = new HumiditySensors({
                    userID: userID,
                    data: data,
                    Date: date,
                });
                await humidityData.save();
                break;
            case 'location':
                const [X, Y] = data.split('-');
                const locationData = new Location({
                    userID: userID,
                    X: X,
                    Y: Y,
                    Date: req.time || new Date(),
                });
                await locationData.save();
                break;
            default: break;
        }
    }
    catch (error) {
        console.error('Lỗi khi lưu dữ liệu cảm biến:', error);
        throw new Error('Lưu dữ liệu cảm biến thất bại');
    }
});

module.exports = sensorQueue;
