const mqttClient = require('../services/mqtt');

const connect = () => {
    mqttClient.subscribeToFeeds((feed, message) => {
        console.log(`Data received from feed ${feed}: ${message}`);
    });
}

const publish = (data) => {
    mqttClient.publishData(data);
}

module.exports = { connect, publish };
