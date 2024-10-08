require('dotenv').config();
const WebSocket = require('ws');
const TemperatureSensor = require('../models/TemperatureSensors');
const HumiditySensor = require('../models/HumiditySensors');
const Location = require('../models/Location');
const modelUser = require('../models/Users');

let client = null;

const connect = async (req, res) => {
    const userId = req.user.id;
    const user = await modelUser.findById(userId).exec();
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const webServerIp = user.webServerIp;

    if (!webServerIp) {
        return res.status(404).json({ error: 'Webserver IP not found' });
    }
    const wsUrl = "ws://" + webServerIp + "/ws";

    try {
        client = new WebSocket(wsUrl);
        client.on('open', () => {
            console.log('Connected to WebSocket Webserver');
            res.status(200).json({ message: 'Connected to WebSocket Webserver' });
        });

        client.on('message', (message) => {
            if (Buffer.isBuffer(message)) {
                message = message.toString();
            }
            try {
                const data = JSON.parse(message);
                if (data.temperature !== undefined) {
                    console.log(`Temperature data received: ${data.temperature}°C`);
                    const tempData = new TemperatureSensor({
                        userID: userId,
                        data: parseFloat(data.temperature),
                        Date: new Date(),
                    });
                    tempData.save();
                    console.log('Temperature data saved to MongoDB');
                }

                if (data.humidity !== undefined) {
                    console.log(`Humidity data received: ${data.humidity}%`);
                    const humidityData = new HumiditySensor({
                        userID: userId,
                        data: parseFloat(data.humidity),
                        Date: new Date(),
                    });
                    humidityData.save();
                    console.log('Humidity data saved to MongoDB');
                }

                if (data.location !== undefined) {
                    console.log(`Location data received: ${data.location}`);
                    const [X, Y] = data.location.split('-');
                    const locationData = new Location({
                        userID: userId,
                        X: X,
                        Y: Y,
                        Date: new Date(),
                    });
                    locationData.save();
                    console.log('Location data saved to MongoDB');
                }

            } catch (error) {
                console.error('Error processing message:', error);
            }
        });

        client.on('error', (error) => {
            console.error('Error connecting to WebSocket', error);
            res.status(500).json({ error: 'Error connecting to WebSocket , please go to profile for checking WebserverIP.' });
        });
    } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        res.status(500).json({ error: 'Error connecting to WebSocket , please go to profile for checking WebserverIP.' });
    }
};

const publishdata = (req, res, next) => {
    if (!client) {
        return res.status(500).json({ error: 'WebSocket not connected' });
    }
    const { relayid, scheduleid, state, mode, day, time, actions } = req;
    try {
        let jsonData;
        if (mode === 'Schedule') {
            const status = state ? 'true' : 'false';
            jsonData = JSON.stringify({
                mode: mode,
                id: scheduleid,
                state: status,
                days: day,
                time: time,
                actions: actions
            });
        }
        else if (mode === 'Manual') {
            const status = state ? 'ON' : 'OFF';
            jsonData = JSON.stringify({
                mode: mode,
                index: relayid,
                state: status
            });
        }
        client.send(jsonData);
        next();
    } catch (error) {
        console.error('Error sending data over WebSocket:', error);
        res.status(500).json({ error: 'Error sending data over WebSocket' });
    }
};

const disconnect = (req, res) => {
    try {
        client.close();
        console.log('Disconnected from WebSocket');
    } catch (error) {
        console.error('Error disconnecting WebSocket:', error);
        res.status(500).json({ error: 'Error disconnecting WebSocket' });
    }
};

module.exports = {
    connect,
    publishdata,
    disconnect,
};
