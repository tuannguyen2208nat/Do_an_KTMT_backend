require('dotenv').config()
const mqtt = require('mqtt');

const AIO_USERNAME = process.env.MQTT_USERNAME;
const AIO_KEY = process.env.MQTT_PASSWORD;
const AIO_PORT = process.env.MQTT_PORT;
// Generate a random clientId
const clientId = "client" + Math.random().toString(36).substring(7);

// Configure MQTT connection
const client = mqtt.connect(`mqtts://${AIO_USERNAME}:${AIO_KEY}@io.adafruit.com`, {
    port: AIO_PORT, // Secure MQTT port
    clientId: clientId
});


const statusFeed = `${AIO_USERNAME}/feeds/status`;
const tempFeed = `${AIO_USERNAME}/feeds/temperature`;
const humFeed = `${AIO_USERNAME}/feeds/humidity`;

client.on('connect', () => {
    console.log('Connected to MQTT');
});

function publishData(data) {
    client.publish(statusFeed, data, (err) => {
        if (err) {
            console.error('Error publishing data:', err);
        } else {
            console.log('Data published to status feed:', data);
        }
    });
}

function subscribeToFeeds(callback) {
    [tempFeed, humFeed].forEach(feed => {
        client.subscribe(feed, (err) => {
            if (err) {
                console.error('Subscription error:', err);
            } else {
                console.log(`Subscribed to feed: ${feed}`);
            }
        });
    });
    client.on('message', (topic, message) => {
        const feed = topic;
        const data = message.toString();
        callback(feed, message.toString());
    });
}

client.on('error', (err) => {
    console.error('Connection error:', err);
});

module.exports = {
    publishData,
    subscribeToFeeds
};