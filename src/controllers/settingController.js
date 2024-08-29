const Setting = require('../models/Setting');

const add_setting = async (req, res) => {
    try {
        const userID = req.user.id;
        const mode = 'Light';
        const language = 'English';
        const connect = 'MQTT';

        const existingSetting = await Setting.findOne({ userID });
        if (existingSetting) {
            const setting = await Setting.find({ userID: userID });
            return res.status(200).json({ error: 'Setting already exists for this user.', setting });
        }
        const setting = new Setting({ userID, mode, language, connect });
        await setting.save();
        res.status(200).json({ message: 'Setting added successfully.', setting });
    }
    catch (error) {
        console.error('Error setting data:', error);
        res.status(500).json({ error: 'An error occurred while setting data.' });
    }

}

const set_setting = async (req, res) => {
    try {
        const userID = req.user.id;
        let { mode, language, connect } = req.body;
        if (!mode) {
            return res.status(400).json({ error: 'Mode is required.' });
        }
        if (!language) {
            return res.status(400).json({ error: 'Language is required.' });
        }
        if (!connect) {
            return res.status(400).json({ error: 'Connect is required.' });
        }
        const setting = await Setting.findOne({ userID: userID });
        if (!setting) {
            return res.status(404).json({ error: 'Settting not found.' });
        }
        setting.mode = mode;
        setting.language = language;
        setting.connect = connect;
        await setting.save();
        return res.status(200).json({ message: 'Setting updated successfully.' });
    }
    catch (error) {
        console.error('Error setting data:', error);
        res.status(500).json({ error: 'An error occurred while setting data.' });
    }
}

const get_setting = async (req, res) => {
    try {
        const userID = req.user.id;
        const setting = await Setting.find({ userID: userID });
        const settingArray = [...setting];
        res.status(200).json(settingArray);
    }
    catch (error) {
        console.error('Error setting data:', error);
        res.status(500).json({ error: 'An error occurred while setting data.' });
    }
}

module.exports = {
    add_setting,
    set_setting,
    get_setting,
};