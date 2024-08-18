const HumiditySensors = require('../models/HumiditySensors');
const TemperatureSensors = require('../models/TemperatureSensors');

const getTemp = async (req, res) => {
    try {
        const userID = req.user.id;
        const latestData = await TemperatureSensors.findOne({ userID: userID })
            .sort({ Date: -1 })
            .exec();

        if (latestData) {
            res.json({
                status: 200,
                data: latestData.data,
            });
        } else {
            return res.status(404).json({
                message: 'No temperature data found for this user.',
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
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
            res.json({
                status: 200,
                data: latestData.data,
            });
        } else {
            return res.status(404).json({
                message: 'No humidity data found for this user.',
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports = { getTemp, getHumi };
