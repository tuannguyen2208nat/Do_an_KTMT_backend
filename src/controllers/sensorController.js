const HumiditySensors = require('../models/HumiditySensors');
const TemperatureSensors = require('../models/TemperatureSensors');
const Location = require('../models/Location');

const getTemp = async (req, res) => {
    try {
        const userID = req.user.id;
        const latestData = await TemperatureSensors.findOne({ userID: userID })
            .sort({ Date: -1 })
            .exec();

        if (latestData) {
            res.status(200).json({
                data: latestData.data,
            });
        } else {
            return res.status(404).json({
                error: 'No temperature data found for this user.',
            });
        }
    } catch (error) {
        res.status(500).json({
            error: 'Server error',
        });
    }
};

const getHumi = async (req, res) => {
    try {
        const userID = req.user.id;
        const latestData = await HumiditySensors.findOne({ userID: userID })
            .sort({ Date: -1 })
            .exec();

        if (latestData) {
            res.status(200).json({
                data: latestData.data,
            });
        } else {
            return res.status(404).json({
                error: 'No humidity data found for this user.',
            });
        }
    } catch (error) {
        res.status(500).json({
            error: 'Server error',
        });
    }
};

const getLocation = async (req, res) => {
    try {
        const userID = req.user.id;
        const location = await Location.findOne({ userID: userID })
            .sort({ Date: -1 })
            .exec();

        if (location) {
            res.status(200).json({
                X: location.X,
                Y: location.Y,
            });
        } else {
            return res.status(404).json({
                error: 'No location data found for this user.',
            });
        }
    } catch (error) {
        res.status(500).json({
            error: 'Server error',
        });
    }
}

module.exports = { getTemp, getHumi, getLocation };
