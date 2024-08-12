import mongoose, { Schema } from 'mongoose'
const Schema = mongoose.Schema;

const Relay = new Schema({
    userID: { type: ObjectId, ref: 'Users', required: true },
    relay_id: { type: Number, required: true, unique: true },
    relay_name: { type: String },
    Date: { type: Date, required: true }
})

module.exports = mongoose.model('Relays', Relay);
