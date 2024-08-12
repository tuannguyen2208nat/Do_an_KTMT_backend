const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Users = new Schema({
    username: {
        type: String,
        unique: true,  // Ensure username is unique
        maxLength: 255
    },
    email: {
        type: String,
        unique: true,  // Ensure email is unique
        required: true // Make email required
    },
    password: {
        type: String,
        required: true // Make password required
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('user', Users);
