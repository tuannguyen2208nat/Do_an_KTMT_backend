const mqtt = require('mqtt');
require('dotenv').config();
const modelUser = require('../models/Users');
const sensorQueue = require('../queue/sensorQueue');
const relayQueue = require('../queue/relayQueue');


const AIO_PORT = process.env.AIO_PORT;

let clients = {};

const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
};

const saveData = async (email, type, data, date, mode = undefined) => {
    const user = await modelUser.findOne({ email: email });
    if (!user) {
        return;
    }
    console.log(
        `\x1b[0m{ Date: \x1b[32m${formatDate(date)}\x1b[0m, Email: \x1b[32m${email}\x1b[0m, Type: \x1b[32m${type}\x1b[0m, Data: \x1b[32m${data}\x1b[0m }\x1b[0m`
    );

    if (type === 'temp') {
        sensorQueue.add({ userID: user.id, sensor: 'temperature', data, date });
    } else if (type === 'humi') {
        sensorQueue.add({ userID: user.id, sensor: 'humidity', data, date });
    } else if (type === 'location') {
        sensorQueue.add({ userID: user.id, sensor: 'location', data, date });
    }
    else if (type === 'relay') {
        relayQueue.add({ userID: user.id, data, date, email });
    }
    else if (type === 'history') {
        if (!mode) {
            return;
        }
        if (mode === 'Temp_Humi') {
            const [temp, humi] = data.split('-');
            sensorQueue.add({ userID: user.id, sensor: 'temperature', temp, date });
            sensorQueue.add({ userID: user.id, sensor: 'humidity', humi, date });
        }
        else if (mode === 'location') {
            sensorQueue.add({ userID: user.id, sensor: 'location', data, date });
        }

    }
};

const connectAllUsers = async () => {
    const users = await modelUser.find();
    if (!users || users.length === 0) {
        console.log('No users found');
        return;
    }

    users.forEach(user => {
        const { AIO_USERNAME, AIO_KEY } = user;
        console.log(`Trying to connect for user: ${user.username}`);

        if (!AIO_USERNAME || !AIO_KEY) {
            console.error(`User ${user.username} does not have Adafruit IO credentials`);
            return;
        }

        const clientId = `client-${user._id}-${Math.random().toString(36).substring(7)}`;

        const client = mqtt.connect(
            `mqtts://${AIO_USERNAME}:${AIO_KEY}@io.adafruit.com`,
            {
                port: AIO_PORT,
                clientId: clientId,
            }
        );

        clients[user._id] = client;

        client.on('connect', () => {
            console.log(`Connected to MQTT for user: ${user.username}`);
            subscribeToFeeds(client, AIO_USERNAME, user._id);
        });

        client.on('error', (err) => {
            console.error(`Connection error for user ${user.username}:`, err);
            client.end();
        });
    });

    console.log('Finished attempting to connect to MQTT for all users');
};

const subscribeToFeeds = (client, AIO_USERNAME, UserID) => {
    const tempFeed = `${AIO_USERNAME}/feeds/temperature`;
    const humFeed = `${AIO_USERNAME}/feeds/humidity`;
    const locationFeed = `${AIO_USERNAME}/feeds/location`;
    const historyFeed = `${AIO_USERNAME}/feeds/history`;
    const relayFeed = `${AIO_USERNAME}/feeds/relay-status`;

    [tempFeed,
        humFeed,
        historyFeed,
        locationFeed,
        relayFeed].forEach((feed) => {
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
        try {
            const jsonData = JSON.parse(message.toString());
            const { email, data, mode, time } = jsonData;
            if (!email || data === undefined) {
                console.warn('No email provided. Skipping saveData call.');
                return;
            }
            if (feed.includes('temperature')) {
                saveData(email, 'temp', parseFloat(data), new Date());
            } else if (feed.includes('humidity')) {
                saveData(email, 'humi', parseFloat(data), new Date());
            } else if (feed.includes('location')) {
                saveData(email, 'location', data, new Date());
            }
            else if (feed.includes('relay-status')) {
                saveData(email, 'relay', data, new Date());
            }
            else if (feed.includes('history')) {
                saveData(email, 'history', data, time, mode);
            }
        } catch (error) {
            console.error('Error saving data to MongoDB:', error);
        }
    });
};

const disconnectMqtt = async (req, res) => {
    const userID = req.user.id;
    try {
        const user = await modelUser.findById(userID);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { AIO_USERNAME } = user;
        if (clients[userID]) {
            clients[userID].end(() => {
                console.log(`Disconnected from MQTT for user: ${AIO_USERNAME}`);
            });
            delete clients[userID];
            return res.status(200).json({ message: `Disconnected from MQTT for user: ${AIO_USERNAME}` });
        } else {
            return res.status(404).json({ message: 'No active MQTT connection for this user' });
        }
    } catch (error) {
        console.error('Error disconnecting from MQTT:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const reconnectMqtt = async (req, res) => {
    const userID = req.user.id;
    try {
        const user = await modelUser.findById(userID);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { AIO_USERNAME, AIO_KEY } = user;
        if (!AIO_USERNAME || !AIO_KEY) {
            console.error(`User ${user.username} does not have Adafruit IO credentials`);
            return res.status(400).json({ message: `User ${user.username} does not have Adafruit IO credentials` });
        }

        if (clients[userID]) {
            clients[userID].end();
            delete clients[userID];
        }

        const clientId = `client-${user._id}-${Math.random().toString(36).substring(7)}`;
        const client = mqtt.connect(
            `mqtts://${AIO_USERNAME}:${AIO_KEY}@io.adafruit.com`,
            {
                port: AIO_PORT,
                clientId: clientId,
            }
        );
        clients[userID] = client;
        client.on('connect', async () => {
            console.log(`Reconnected to MQTT for user: ${user.username}`);
            subscribeToFeeds(client, AIO_USERNAME, user._id);
            try {
                if (req.case === 'true') {
                    await user.save();
                    const userProfile = user.toObject();
                    delete userProfile.password;
                    return res.status(200).json({
                        message: 'Profile updated successfully',
                        data: userProfile,
                    });
                }
                return res.status(200).json({ message: `Reconnected to MQTT for user: ${AIO_USERNAME}` });
            } catch (error) {
                console.error('Error saving user profile after MQTT connection:', error);
                return res.status(500).json({ message: 'Error saving user profile after successful MQTT connection' });
            }
        });

        client.on('error', (err) => {
            console.error(`Connection error for user ${user.username}:`, err);
            client.end();
            return res.status(500).json({ message: 'MQTT connection error , please change Adafruit account' });
        });
    } catch (error) {
        console.error('Error reconnecting to MQTT:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const publishdata = async (req, res, next) => {
    const userID = req.user.id;
    if (!clients[userID]) {
        return res.status(400).json({ error: 'MQTT not connected' });
    }
    const { feed, relayid, scheduleid, state, mode, day, time, actions, AIO_USERNAME } = req;
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
    clients[userID].publish(feedPath, jsonData, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to publish data' });
        } else {
            next();
        }
    });
};

module.exports = {
    connectAllUsers,
    disconnectMqtt,
    reconnectMqtt,
    publishdata
};
