const HumiditySensors = require("../models/HumiditySensors"); // Ensure model name matches schema
const TemperatureSensors = require('../models/TemperatureSensors'); // Ensure model name matches schema

const getTemp = async (req, res) => {
    try {
        const { userID } = req.body; // Make sure the client sends 'userID' in the body
        console.log('User ID:', userID);
        const latestData = await TemperatureSensors.findOne({ userID: userID })
            .sort({ Date: -1 }) // Ensure 'Date' exists in the schema
            .exec();

        if (latestData) {
            res.json({
                status: 200,
                data: latestData.data, // Assuming 'data' contains the relevant temperature information
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
    console.log('Get Humidity');
    try {
        const { userID } = req.body;
        console.log('User ID:', userID);
        const latestData = await HumiditySensors.findOne({ userID: userID })
            .sort({ Date: -1 }) // Ensure 'Date' exists in the schema
            .exec();

        if (latestData) {
            res.json({
                status: 200,
                data: latestData.data, // Assuming 'data' contains the relevant humidity information
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
