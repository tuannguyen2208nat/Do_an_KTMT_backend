const HumiditySensors = require("../models/HumiditySensors"); // Ensure model name matches schema
const TemperatureSensors = require('../models/TemperatureSensors'); // Ensure model name matches schema

const getTemp = async (req, res) => {
    try {
        const { userID } = req.body; // Changed from userid to userID to match schema
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
                message: 'No data found for this userID.',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
}

const getHumi = async (req, res) => {
    try {
        const { userID } = req.body; // Changed from userid to userID to match schema
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
                message: 'No data found for this userID.',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
}

module.exports = { getTemp, getHumi };
