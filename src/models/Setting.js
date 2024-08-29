const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingSchema = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    mode: { type: String, required: true },
    language: { type: String, required: true },
    connect: { type: String, required: true },
});

module.exports = mongoose.model('Setting', SettingSchema, 'Setting');
