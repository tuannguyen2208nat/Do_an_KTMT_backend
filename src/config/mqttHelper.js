const mqttClient = require('../services/mqtt');

const connect = () => {
    mqttClient.subscribeToFeed((topic, message) => {
        console.log(`Received message from ${topic}: ${message}`);
    });
}

const publish = (data) => {
    mqttClient.publishData(data);
}

module.exports = { connect, publish };
