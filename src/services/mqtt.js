require('dotenv').config()
const mqtt = require('mqtt');

const AIO_USERNAME = process.env.MQTT_USERNAME;
const AIO_KEY = process.env.MQTT_PASSWORD;
const AIO_PORT = process.env.MQTT_PORT;
const clientId = "client" + Math.random().toString(36).substring(7);

const client = mqtt.connect(`mqtts://${AIO_USERNAME}:${AIO_KEY}@io.adafruit.com`, {
    port: AIO_PORT,
    clientId: clientId
});

const feed = `${AIO_USERNAME}/feeds/status`;

// Export method to publish data
function publishData(data) {
    client.publish(feed, data, (err) => {
        if (err) {
            console.error('Error publishing data:', err);
        } else {
            console.log('Data published:', data);
        }
    });
}

function subscribeToFeed(callback) {
    client.subscribe(feed, (err) => {
        if (err) {
            console.error('Error subscribing:', err);
        } else {
            console.log(`Subscribed to feed: ${feed}`);
        }
    });

    client.on('message', (topic, message) => {
        callback(topic, message.toString());
    });
}

client.on('error', (err) => {
    console.error('Connection error:', err);
});


module.exports = {
    publishData,
    subscribeToFeed
};
