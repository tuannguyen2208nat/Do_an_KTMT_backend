const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Relay = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    relay_id: { type: Number, required: true, unique: true },
    relay_name: { type: String },
    state: { type: Boolean, required: true },
});

module.exports = mongoose.model('Relay', Relay, 'Relay');
