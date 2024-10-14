const mqtt = require('mqtt');
require('dotenv').config();
const TemperatureSensor = require('../models/TemperatureSensors');
const HumiditySensor = require('../models/HumiditySensors');
const Location = require('../models/Location');
const modelUser = require('../models/Users');

const AIO_PORT = process.env.AIO_PORT;

let AIO_USERNAME;

let client = null;

const saveData = async (type, data, time) => {
    if (type === 'temp') {
        const tempData = new TemperatureSensor({
            userID: userId,
            data: data,
            Date: time,
        });
        await tempData.save();
        console.log('Temperature data saved to MongoDB');
    }
    else if (type === 'humi') {
        const humidityData = new HumiditySensor({
            userID: userId,
            data: data,
            Date: time,
        });
        await humidityData.save();
        console.log('Humidity data saved to MongoDB');
    }
    else if (type === 'location') {
        const [X, Y] = data.split('-');
        const locationData = new Location({
            userID: userId,
            X: X,
            Y: Y,
            Date: time,
        });
        await locationData.save();
        console.log('Location data saved to MongoDB');
    }

};

const connect = async (req, res) => {
    const userId = req.user.id;
    const user = await modelUser.findById(userId).exec();
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const { AIO_KEY } = user;
    AIO_USERNAME = user.AIO_USERNAME;
    if (!AIO_USERNAME || !AIO_KEY) {
        return res.status(400).json({ error: 'User does not have Adafruit IO credentials' });
    }
    const clientId = 'client' + Math.random().toString(36).substring(7);

    client = mqtt.connect(
        `mqtts://${AIO_USERNAME}:${AIO_KEY}@io.adafruit.com`,
        {
            port: AIO_PORT,
            clientId: clientId,
        }
    );

    client.on('connect', () => {
        console.log('Connected to MQTT');
        res.status(200).json({ message: 'Connected to MQTT' });
        subscribeToFeeds(client, AIO_USERNAME, userId);
    });

    client.on('error', (err) => {
        console.error('Connection error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error connecting to MQTT,please go to profile to check AIO.' });
        }
    });
};

const subscribeToFeeds = (client, AIO_USERNAME, userId) => {
    const tempFeed = `${AIO_USERNAME}/feeds/temperature`;
    const humFeed = `${AIO_USERNAME}/feeds/humidity`;
    const locationFeed = `${AIO_USERNAME}/feeds/location`;
    const historyFeed = `${AIO_USERNAME}/feeds/history`;

    [tempFeed, humFeed, locationFeed, historyFeed].forEach((feed) => {
        client.subscribe(feed, (err) => {
            if (err) {
                console.error('Subscription error:', err);
            } else {
                console.log(`Subscribed to feed: ${feed}`);
            }
        });
    });

    client.on('message', async (topic, message) => {
        const feed = topic;
        const data = message.toString();
        try {
            if (feed.includes('temperature')) {
                console.log(`Temperature data received: ${data}°C`);
                saveData('temp', parseFloat(data), new Date());
            } else if (feed.includes('humidity')) {
                console.log(`Humidity data received: ${data}%`);
                saveData('humi', parseFloat(data), new Date());
            } else if (feed.includes('location')) {
                console.log(`Location data received: ${data}`);
                saveData('location', data, new Date());
            }
            else if (feed.includes('history')) {
                console.log(`History data received: ${data}`);
                const historyData = JSON.parse(data);
                const { mode, time } = historyData;

                const [hourMinute, dayMonthYear] = time.split('-');
                const [hour, minute] = hourMinute.split(':');
                const [day, month, year] = dayMonthYear.split(':');
                const timeDate = new Date(year, month - 1, day, hour, minute);

                if (mode === 'temp_humi') {
                    const { temperature, humidity } = historyData;
                    saveData('temp', parseFloat(temperature), timeDate);
                    saveData('humi', parseFloat(humidity), timeDate);
                }
                else if (mode === 'location') {
                    const { data } = historyData;
                    saveData('location', data, timeDate);
                }
            }
        } catch (error) {
            console.error('Error saving data to MongoDB:', error);
        }
    });
};

const publishdata = (req, res, next) => {
    if (!client) {
        return res.status(400).json({ error: 'MQTT not connected' });
    }
    const { feed, relayid, scheduleid, state, mode, day, time, actions } = req;
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
    const feedPath = `${AIO_USERNAME}/feeds/${feed}`;
    client.publish(feedPath, jsonData, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to publish data' });
        } else {
            next();
        }
    });
};

const disconnect = (req, res) => {
    if (client) {
        client.end(() => {
            console.log('Disconnected from MQTT');
        });
    } else {
        res.status(400).json({ error: 'Not connected to MQTT' });
    }
};

module.exports = {
    connect,
    subscribeToFeeds,
    publishdata,
    disconnect,
};
