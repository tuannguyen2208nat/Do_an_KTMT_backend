const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActionSchema = new Schema({
    relayId: { type: Number, required: true },
    action: { type: String, required: true }
});

const ScheduleSchema = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    schedule_id: { type: Number, required: true },
    schedule_name: { type: String },
    state: { type: Boolean, required: true },
    days: { type: [String], required: true },
    time: { type: String, required: true },
    actions: { type: [ActionSchema], required: true },
});

ScheduleSchema.index({ userID: 1, schedule_id: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', ScheduleSchema, 'Schedule');
