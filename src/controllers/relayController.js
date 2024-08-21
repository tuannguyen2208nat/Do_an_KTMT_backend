const Relay = require('../models/Relay');


const add_relay = async (req, res) => {
    try {
        next();
    }
    catch (error) {
        console.error('Error setting data:', error);
        res.status(500).json({ error: 'An error occurred while setting data.' });
    }
}

const get_relay = async (req, res) => {
    try {
        next();
    }
    catch (error) {
        console.error('Error setting data:', error);
        res.status(500).json({ error: 'An error occurred while setting data.' });
    }
}

const set_relay = async (req, res) => {
    try {
        next();
    }
    catch (error) {
        console.error('Error setting data:', error);
        res.status(500).json({ error: 'An error occurred while setting data.' });
    }
}

const delete_relay = async (req, res) => {
    try {
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
    delete_relay,
};