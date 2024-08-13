const mqttClient = require('../services/mqtt');
const TemperatureSensor = require('../models/TemperatureSensors');
const HumiditySensor = require('../models/HumiditySensors');

const connect = () => {
    mqttClient.subscribeToFeeds(async (feed, message) => {
        if (feed.includes('humidity')) {
            console.log(`Humidity data received: ${message}%`);
            try {
                const humidityData = new HumiditySensor({
                    userID: '66b981e8fe2a7db26025c680',
                    data: parseFloat(message),
                    Date: new Date(),
                });
                await humidityData.save();
                console.log('Humidity data saved to MongoDB');
            } catch (error) {
                console.error('Error saving humidity data to MongoDB:', error);
            }
        } else if (feed.includes('temp')) {
            console.log(`Temperature data received: ${message}°C`);
            try {
                const tempData = new TemperatureSensor({
                    userID: '66b981e8fe2a7db26025c680',
                    data: parseFloat(message),
                    Date: new Date(),
                });
                await tempData.save();
                console.log('Temperature data saved to MongoDB');
            } catch (error) {
                console.error(
                    'Error saving temperature data to MongoDB:',
                    error,
                );
            }
        }
    });
};

const publish = (data) => {
    mqttClient.publishData(data);
};

module.exports = { connect, publish };
