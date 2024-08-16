const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Location = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    X: { type: String, required: true },
    Y: { type: String, required: true }
});

module.exports = mongoose.model(
    'Location',
    Location,
    'Location',
);
