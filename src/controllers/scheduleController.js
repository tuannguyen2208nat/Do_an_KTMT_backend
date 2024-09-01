const Schedule = require('../models/Schedule');
const mqttController = require('../controllers/mqttController');
const wsvController = require('../controllers/wsvController');

const generateUniqueScheduleId = async (userID) => {
    let scheduleId;
    let isUnique = false;

    while (!isUnique) {
        scheduleId = Math.floor(Math.random() * 20) + 1;
        const existingSchedule = await Schedule.findOne({ userID, schedule_id: scheduleId });
        if (!existingSchedule) {
            isUnique = true;
        }
    }

    return scheduleId;
};

const add_schedule = async (req, res, next) => {
    try {
        const userID = req.user.id;
        const { schedule_name, days, time, actions, } = req.body;
        if (!userID) {
            return res.status(400).json({ error: 'User id is required.' });
        }
        if (!schedule_name) {
            return res.status(400).json({ error: 'Schedule name is required.' });
        }
        if (!days || !time || !actions) {
            return res.status(400).json({ error: 'Days, time and actions are required.' });
        }
        const existingSchedule = await Schedule.findOne({ userID, schedule_name });
        if (existingSchedule) {
            return res.status(400).json({ error: 'This schedule already exists for this user.' });
        }
        const schedule_id = await generateUniqueScheduleId(userID);
        const schedule = new Schedule({ userID, schedule_id, schedule_name, state: false, days, time, actions });
        await schedule.save();
        req.activity = `Schedule ${schedule_name} added`;
        next();
    } catch (error) {
        res.status(500).json({
            error: 'Server error',
        });
    }
};

const get_schedule = async (req, res) => {
    try {
        const userID = req.user.id;
        const schdules = await Schedule.find({ userID: userID });
        const schedulesArray = [...schdules];
        res.status(200).json(schedulesArray);
    }
    catch (error) {
        res.status(500).json({
            error: 'Server error',
        });
    }
}

const set_schedule = async (req, res, next) => {
    try {
        const userID = req.user.id;
        const { schedule_id, new_schedule_name, new_days, new_time, new_actions } = req.body;

        if (!schedule_id) {
            return res.status(400).json({ error: 'Schedule id is required.' });
        }

        const schedule = await Schedule.findOne({ schedule_id: schedule_id, userID: userID });
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found.' });
        }

        let result = '';
        if (new_schedule_name) {
            const existingSchedule = await Schedule.findOne({ schedule_name: new_schedule_name, userID: userID });
            if (existingSchedule) {
                return res.status(400).json({ error: 'New schedule name already exists.' });
            }
            schedule.schedule_name = new_schedule_name;
            result += `Schedule name changed to ${new_schedule_name}. `;
        }
        if (new_days) {
            schedule.days = new_days;
            result += `Days updated to ${new_days.join(', ')}. `;
        }
        if (new_time) {
            schedule.time = new_time;
            result += `Time updated to ${new_time}. `;
        }
        if (new_actions) {
            schedule.actions = new_actions;
            result += `Actions updated. `;
        }
        await schedule.save();
        req.activity = result.trim();
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Server error',
        });
    }
};

const set_status = async (req, res, next) => {
    try {
        const userID = req.user.id;
        const { schedule_id, state, connect } = req.body;
        if (!schedule_id) {
            return res.status(400).json({ error: 'Schedule id is required.' });
        }
        if (state === undefined) {
            return res.status(400).json({ error: 'State is required.' });
        }
        if (connect === undefined) {
            return res.status(400).json({ error: 'Connect is required.' });
        }
        const schedule = await Schedule.findOne({ schedule_id: schedule_id, userID: userID });
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found.' });
        }
        schedule.state = state;
        await schedule.save();
        req.scheduleid = schedule_id;
        req.state = state;
        req.feed = 'schedule';
        req.activity = `Schedule ${schedule.schedule_name} state changed to ${schedule.state ? 'on' : 'off'}`;
        req.controller = connect === 'MQTT' ? mqttController : wsvController;
        next();
    }
    catch (error) {
        res.status(500).json({
            error: 'Server error',
        });
    }
}

const delete_schedule = async (req, res, next) => {
    try {
        const userID = req.user.id;
        const { schedule_id } = req.body;
        if (!schedule_id) {
            return res.status(400).json({ error: 'Schedule id is required.' });
        }
        const schedule = await Schedule.findOne({ schedule_id: schedule_id, userID: userID });
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found.' });
        }
        const name = schedule.schedule_name;
        await schedule.deleteOne();
        req.activity = `Schedule ${name} deleted.`;
        next();
    }
    catch (error) {
        res.status(500).json({
            error: 'Server error',
        });
    }
}

module.exports = {
    add_schedule,
    get_schedule,
    set_schedule,
    set_status,
    delete_schedule
};