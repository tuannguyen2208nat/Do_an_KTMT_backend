const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Users = new Schema({
    username: {
        type: String,
        unique: true,
        maxLength: 255,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone_number: {
        type: String,
    },
    address: {
        type: String,
    },
    AIO_USERNAME: {
        type: String,
        required: true,
    },
    AIO_KEY: {
        type: String,
        required: true,
    },
    accessToken: {
        type: String,
    },
    refreshToken: {
        type: String,
    },
});

module.exports = mongoose.model('Users', Users, 'Users');
