const HumiditySensors = require('../models/HumiditySensors');
const TemperatureSensors = require('../models/TemperatureSensors');

const getTemp = async (req, res) => {
    try {
        const userId = req.user.id;
        const { time } = req.body;
        console.log(userId);
        console.log(time);

        if (!time || !userId) {
            return res.status(400).json({ error: 'Time period and user ID are required.' });
        }

        // Calculate the start and end dates
        const endDate = new Date(); // Today's date
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - time + 1); // Subtract 'n' days from today's date

        // Retrieve data
        const data = await TemperatureSensors.find({
            userID: userId,
            Date: {
                $gte: startDate,
                $lte: endDate
            }
        })
            .select('data Date')
            .exec();

        if (data.length === 0) {
            // Generate all dates in the range
            const allDates = [];
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                allDates.push({
                    Date: currentDate.toISOString().split('T')[0],
                    AverageTemperature: 0
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return res.status(200).json(allDates);
        }

        // Group data by date and calculate daily averages
        const groupedData = data.reduce((acc, item) => {
            const date = item.Date.toISOString().split('T')[0]; // Extract just the date part
            if (!acc[date]) {
                acc[date] = { total: 0, count: 0 };
            }
            acc[date].total += item.data;
            acc[date].count += 1;
            return acc;
        }, {});

        // Generate all dates in the range
        const allDates = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            const averageTemp = groupedData[dateString]
                ? (groupedData[dateString].total / groupedData[dateString].count).toFixed(2)
                : 0;
            allDates.push({
                Date: dateString,
                AverageTemperature: averageTemp
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        res.status(200).json(allDates);

    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'An error occurred while retrieving data.' });
    }
};

const getHumi = async (req, res) => {
    try {
        const userId = req.user.id;
        const { time } = req.body;
        console.log(userId);
        console.log(time);

        if (!time || !userId) {
            return res.status(400).json({ error: 'Time period and user ID are required.' });
        }

        // Calculate the start and end dates
        const endDate = new Date(); // Today's date
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - time + 1); // Subtract 'n' days from today's date

        // Retrieve data
        const data = await HumiditySensors.find({
            userID: userId,
            Date: {
                $gte: startDate,
                $lte: endDate
            }
        })
            .select('data Date')
            .exec();

        if (data.length === 0) {
            // Generate all dates in the range
            const allDates = [];
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                allDates.push({
                    Date: currentDate.toISOString().split('T')[0],
                    AverageTemperature: 0
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return res.status(200).json(allDates);
        }

        // Group data by date and calculate daily averages
        const groupedData = data.reduce((acc, item) => {
            const date = item.Date.toISOString().split('T')[0]; // Extract just the date part
            if (!acc[date]) {
                acc[date] = { total: 0, count: 0 };
            }
            acc[date].total += item.data;
            acc[date].count += 1;
            return acc;
        }, {});

        // Generate all dates in the range
        const allDates = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            const averageTemp = groupedData[dateString]
                ? (groupedData[dateString].total / groupedData[dateString].count).toFixed(2)
                : 0;
            allDates.push({
                Date: dateString,
                AverageTemperature: averageTemp
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        res.status(200).json(allDates);

    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'An error occurred while retrieving data.' });
    }
}

module.exports = { getTemp, getHumi }