const mqttClient = require('../services/mqtt');
const TemperatureSensor = require('../models/TemperatureSensors');
const HumiditySensor = require('../models/HumiditySensors');
const Location = require('../models/Location');

const connect = async (req, res) => {
    const userID = req.user.id;
    mqttClient.subscribeToFeeds(async (feed, message) => {
        if (feed.includes('humidity')) {
            console.log(`Humidity data received: ${message}%`);
            try {
                const humidityData = new HumiditySensor({
                    userID: userID,
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
                    userID: userID,
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
        } else if (feed.includes('location')) {
            console.log(`Location data received: ${message}`);
            try {
                const [X, Y] = message.split('-');
                const locationData = new Location({
                    userID: userID,
                    X: X,
                    Y: Y,
                });
                await locationData.save();
                console.log('Location data saved to MongoDB');
            } catch (error) {
                console.error('Error saving location data to MongoDB:',
                    error
                );
            }
        }
    });
};

const disconect = () => {
    mqttClient.disconnect();
};

const publish = (data) => {
    mqttClient.publishData(data);
};

module.exports = { connect, publish, disconect };
