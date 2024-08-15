const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TemperatureSensor = new Schema({
    userID: { type: String, ref: 'Users', required: true },
    data: { type: Number, required: true },
    Date: { type: Date, required: true },
});

module.exports = mongoose.model(
    'TemperatureSensor',
    TemperatureSensor,
    'TemperatureSensor',
); 
