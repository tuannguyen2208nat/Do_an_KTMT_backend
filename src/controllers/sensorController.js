const HumiditySensors = require('../models/HumiditySensors');
const TemperatureSensors = require('../models/TemperatureSensors');
const Location = require('../models/Location');

const setTemp = async (req, res) => {
    try {
        const userID = req.user.id;
        const data = req;
        const tempData = new TemperatureSensors({
            userID: userID,
            data: data,
            Date: req.time || new Date(),
        });
        await tempData.save();
        console.log('Temperature data saved to MongoDB');
    } catch (error) {
        res.status(500).json({
            error: 'Server error',
        });
    }
};

const setHumi = async (req, res) => {
    try {
        const userID = req.user.id;
        const data = req;
        const humidityData = new HumiditySensors({
            userID: userID,
            data: data,
            Date: req.time || new Date(),
        });
        await humidityData.save();
        console.log('Humidity data saved to MongoDB');
    } catch (error) {
        res.status(500).json({
            error: 'Server error',
        });
    }
};

const setLocation = async (req, res) => {
    try {
        const userID = req.user.id;
        const data = req;
        const [X, Y] = data.split('-');
        const locationData = new Location({
            userID: userID,
            X: X,
            Y: Y,
            Date: req.time || new Date(),
        });
        await locationData.save();
        console.log('Location data saved to MongoDB');
    } catch (error) {
        res.status(500).json({
            error: 'Server error',
        });
    }
};

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

module.exports = { setTemp, setHumi, setLocation, getTemp, getHumi, getLocation };
