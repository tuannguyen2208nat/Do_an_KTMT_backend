const mqttController = require('../controllers/mqttController');
const wsvController = require('../controllers/wsvController');

let connected = false;
let currentConnection = null;

const connect = async (req, res, next) => {
    const newConnection = req.body.connect;

    if (!newConnection || (newConnection !== 'MQTT' && newConnection !== 'WSV')) {
        return res.status(400).json({ error: 'Please provide a valid mode (MQTT or WSV)' });
    }

    if (connected && currentConnection === newConnection) {
        return res.status(200).json({ error: `Already connected to ${newConnection}` });
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

const publishdata = async (req, res) => {
    req.controller = currentConnection === 'MQTT' ? mqttController : wsvController;
    try {
        await req.controller.publishdata();
    } catch (error) {
        return res.status(500).json({ error: 'Error during disconnection' });
    }
}

const disconnect = async (req, res, next) => {
    if (!connected) {
        return res.status(400).json({ error: 'No active connection to disconnect' });
    }
    req.controller = currentConnection === 'MQTT' ? mqttController : wsvController;
    await req.controller.disconnect();
    connected = false;
    currentConnection = null;
};

module.exports = {
    connect,
    publishdata,
    disconnect
}