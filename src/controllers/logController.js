const HumiditySensors = require('../models/HumiditySensors');
const TemperatureSensors = require('../models/TemperatureSensors');
const modelLog = require('../models/Log');
const logQueue = require('../queue/logQueue');

const setLog = async (req, res) => {
    try {
        const userID = req.user.id;
        const { activity } = req;
        if (!activity) {
            return res.status(400).json({ error: 'Activity is required.' });
        }
        logQueue.add({ userID, activity });
        return res.status(200).json({ message: activity });;
    }
    catch (error) {
        res.status(500).json({
            error: 'Server error',
        });
    }
}

const getNumberOfDays = (startDate, endDate) => {
    const timeDifference = endDate - startDate;
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.floor(timeDifference / oneDay) + 1;
};

const getLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const { start, end } = req.body;

        if (!start || !end) {
            return res.status(400).json({ error: 'Start and end day are requried' });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        if (startDate > endDate) {
            return res.status(400).json({ error: 'Start date must be before end date.' });
        }

        if (getNumberOfDays(startDate, endDate) > 7 && req.role === 'user') {
            return res.status(400).json({ error: 'Please upgradge your account.' });
        }

        const logs = await modelLog.find({
            userID: userId,
            Date: {
                $gte: startDate,
                $lte: endDate
            }
        })
            .select('activity Date')
            .exec();

        const formattedLogs = logs.map(log => {
            const date = new Date(log.Date);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();

            return {
                ...log.toObject(),
                Date: `${hours}/${minutes}/${seconds} ${day}/${month}/${year}`
            };
        });

        return res.status(200).json(formattedLogs);

    } catch (error) {
        return res.status(500).json({
            error: 'Server error',
        });
    }
};

const calculateAverage = (allDates, step, result) => {
    for (let i = 0; i < allDates.length; i += step) {
        let sum = 0;
        let count = 0;

        for (let j = 0; j < step && i + j < allDates.length; j++) {
            let value = parseFloat(allDates[i + j].value);
            if (value !== 0) {
                sum += value
                count++;
            }
        }

        const averageValue = count != 0 ? sum / count : 0;
        const middleDate = allDates[Math.min(i + Math.floor(step / 2), allDates.length - 1)].date;

        result.push({
            date: middleDate,
            value: averageValue.toFixed(1)
        });
    }
}

const getTemp = async (req, res) => {

    try {
        const userId = req.user.id;
        const { time } = req.body;

        if (!time || !userId) {
            return res.status(400).json({ error: 'Time period and user ID are required.' });
        }

        if (time !== 7 && req.role === 'user') {
            return res.status(400).json({ error: 'Please upgradge your account.' });
        }

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - time + 1);

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

        const groupedData = data.reduce((acc, item) => {
            const date = item.Date.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { total: 0, count: 0 };
            }
            acc[date].total += item.data;
            acc[date].count += 1;
            return acc;
        }, {});

        const allDates = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            const averageTemp = groupedData[dateString]
                ? (groupedData[dateString].total / groupedData[dateString].count).toFixed(1)
                : 0;
            allDates.push({
                date: dateString,
                value: averageTemp
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        let result = [];
        if (parseFloat(time) === 7) {
            result = allDates.map(date => ({ ...date }));
            result.pop();
        }
        else if (parseFloat(time) === 30) {
            calculateAverage(allDates, 3, result);
        }
        else if (parseFloat(time) === 90) {
            calculateAverage(allDates, 9, result);
        }

        return res.status(200).json(result);

    } catch (error) {
        return res.status(500).json({
            error: 'Server error',
        });
    }
};

const getHumi = async (req, res) => {
    try {
        const userId = req.user.id;
        const { time } = req.body;

        if (!time || !userId) {
            return res.status(400).json({ error: 'Time period and user ID are required.' });
        }

        if (time !== 7 && req.role === 'user') {
            return res.status(400).json({ error: 'Please upgradge your account.' });
        }

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - time + 1);

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

        const groupedData = data.reduce((acc, item) => {
            const date = item.Date.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { total: 0, count: 0 };
            }
            acc[date].total += item.data;
            acc[date].count += 1;
            return acc;
        }, {});

        const allDates = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            const averageTemp = groupedData[dateString]
                ? (groupedData[dateString].total / groupedData[dateString].count).toFixed(1)
                : 0;
            allDates.push({
                date: dateString,
                value: averageTemp
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        let result = [];
        if (parseFloat(time) === 7) {
            result = allDates.map(date => ({ ...date }));
            result.pop();
        }
        else if (parseFloat(time) === 30) {
            calculateAverage(allDates, 3, result);
        }
        else if (parseFloat(time) === 90) {
            calculateAverage(allDates, 9, result);
        }

        return res.status(200).json(result);

    } catch (error) {
        return res.status(500).json({
            error: 'Server error',
        });
    }
}

module.exports = { setLog, getLog, getTemp, getHumi }