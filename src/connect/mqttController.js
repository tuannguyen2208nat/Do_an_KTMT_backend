const mqtt = require('mqtt');
require('dotenv').config();
const modelUser = require('../models/Users');
const sensorQueue = require('../queue/sensorQueue');

const AIO_PORT = process.env.AIO_PORT;

let clients = {};

const saveData = async (email, type, data, date) => {
    const user = await modelUser.findOne({ email: email });
    if (!user) {
        return;
    }
    if (type === 'temp') {
        sensorQueue.add({ userID: user.id, sensor: 'temperature', data, date });
    } else if (type === 'humi') {
        sensorQueue.add({ userID: user.id, sensor: 'humidity', data, date });
    } else if (type === 'location') {
        sensorQueue.add({ userID: user.id, sensor: 'location', data, date });
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
        try {
            const jsonData = JSON.parse(message.toString());
            const { email, data } = jsonData;
            if (!email || data === undefined) {
                console.warn('No email provided. Skipping saveData call.');
                return;
            }
            if (feed.includes('temperature')) {
                saveData(email, 'temp', parseFloat(data), new Date(), userId);
            } else if (feed.includes('humidity')) {
                saveData(email, 'humi', parseFloat(data), new Date(), userId);
            } else if (feed.includes('location')) {
                saveData(email, 'location', data, new Date(), userId);
            }
        } catch (error) {
            console.error('Error saving data to MongoDB:', error);
        }
    });
};

const disconnectAll = (req, res) => {
    Object.values(clients).forEach(client => {
        client.end(() => {
            console.log('Disconnected from MQTT');
        });
    });
    clients = {};
    res.status(200).json({ message: 'Disconnected from MQTT for all users' });
};

module.exports = {
    connectAllUsers,
    disconnectAll,
};
