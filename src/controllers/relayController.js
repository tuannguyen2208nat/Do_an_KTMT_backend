const Relay = require('../models/Relay');
const { publishdata } = require('./mqttController');

const add_relay = async (req, res, next) => {
    try {
        const userID = req.user.id;
        let { relay_id, relay_name } = req.body;
        if (!userID) {
            return res.status(400).json({ error: 'User id is required.' });
        }
        if (!relay_id) {
            return res.status(400).json({ error: 'Relay id is required.' });
        }
        if (!relay_name) {
            relay_name = `Relay ${relay_id}`;
        }
        const state = false;
        const relay = new Relay({ userID, relay_id, relay_name, state });
        await relay.save();
        req.activity = `Relay ${relay_id} added`;
        next();
    } catch (error) {
        console.error('Error setting data:', error);
        res.status(500).json({ error: 'An error occurred while setting data.' });
    }
};

const get_relay = async (req, res) => {
    try {
        const userID = req.user.id;
        const relays = await Relay.find({ userID: userID });
        const relaysArray = [...relays];
        res.status(200).json(relaysArray);
    }
    catch (error) {
        console.error('Error setting data:', error);
        res.status(500).json({ error: 'An error occurred while setting data.' });
    }
}

const set_relay = async (req, res, next) => {
    try {
        const userID = req.user.id;
        let { relay_id, relay_name, new_relay_id } = req.body;
        if (!relay_id) {
            return res.status(400).json({ error: 'Relay id is required.' });
        }
        const relay = await Relay.findOne({ relay_id: relay_id, userID: userID });
        if (!relay) {
            return res.status(404).json({ error: 'Relay not found.' });
        }
        if (!new_relay_id && relay_name) {
            relay.relay_name = relay_name;
            req.activity = `Relay ${relay_id} name changed to ${relay_name}`;
        }
        else if (new_relay_id && !relay_name) {
            relay.relay_id = new_relay_id;
            req.activity = `Relay ${relay_id} changed to ${new_relay_id}`;
        }
        else if (new_relay_id && relay_name) {
            relay.relay_id = new_relay_id;
            relay.relay_name = relay_name;
            req.activity = `Relay ${relay_id} changed to ${new_relay_id} and name changed to ${relay_name}`;
        }
        await relay.save();
        next();
    }
    catch (error) {
        console.error('Error setting data:', error);
        res.status(500).json({ error: 'An error occurred while setting data.' });
    }
}

const set_status = async (req, res, next) => {
    try {
        const userID = req.user.id;
        const { relay_id, state } = req.body;
        if (!relay_id) {
            return res.status(400).json({ error: 'Relay id is required.' });
        }
        if (state === undefined) {
            return res.status(400).json({ error: 'State is required.' });
        }
        const relay = await Relay.findOne({ relay_id: relay_id, userID: userID });
        if (!relay) {
            return res.status(404).json({ error: 'Relay not found.' });
        }
        relay.state = state;
        await relay.save();
        req.data = `!RELAY${relay_id}:${relay.state ? 'ON' : 'OFF'}#`;
        req.feed = 'relay';
        req.activity = `Relay ${relay_id} state changed to ${relay.state ? 'on' : 'off'}`;
        next();
    }
    catch (error) {
        console.error('Error setting data:', error);
        res.status(500).json({ error: 'An error occurred while setting data.' });
    }
}

const delete_relay = async (req, res, next) => {
    try {
        const userID = req.user.id;
        const { relay_id } = req.body;
        if (!relay_id) {
            return res.status(400).json({ error: 'Relay id is required.' });
        }
        const relay = await Relay.findOne({ relay_id: relay_id, userID: userID });
        if (!relay) {
            return res.status(404).json({ error: 'Relay not found.' });
        }
        await relay.deleteOne();
        req.activity = `Relay ${relay_id} deleted .`;
        next();
    }
    catch (error) {
        console.error('Error setting data:', error);
        res.status(500).json({ error: 'An error occurred while setting data.' });
    }
}

module.exports = {
    add_relay,
    get_relay,
    set_relay,
    set_status,
    delete_relay,
};