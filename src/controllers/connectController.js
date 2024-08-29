const mqttController = require('../controllers/mqttController');
const wsvController = require('../controllers/wsvController');

let connected = false;
let currentConnection = null;

const connect = async (req, res, next) => {
    const newConnection = req.body.connect;

    if (!newConnection || (newConnection !== 'MQTT' && newConnection !== 'WSV')) {
        return res.status(400).json({ message: 'Please provide a valid mode (MQTT or WSV)' });
    }

    if (connected && currentConnection === newConnection) {
        return res.status(200).json({ message: `Already connected to ${newConnection}` });
    }

    if (connected) {
        if (currentConnection === 'MQTT') {
            await mqttController.disconnect();  // Disconnect MQTT
        } else if (currentConnection === 'WSV') {
            await wsvController.disconnect();   // Disconnect WSV
        }
        connected = false;
        currentConnection = null;
    }

    connected = true;
    currentConnection = newConnection;
    req.controller = newConnection === 'MQTT' ? mqttController : wsvController;
    next();
}

const publishdata = async (req, res, next) => {
    const { connect } = req.body.connect;
    req.controller = connect === 'MQTT' ? mqttController : wsvController;
    next();
}

const disconnect = async (req, res, next) => {
    req.controller = currentConnection === 'MQTT' ? mqttController : wsvController;
    next();
}

module.exports = {
    connect,
    publishdata,
    disconnect
}