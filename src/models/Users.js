const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Users = new Schema({
    username: {
        type: String,
        unique: true,
        maxLength: 255,
    },
    fullname: {
        type: String,
        maxLength: 255,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        match: [/\S+@\S+\.\S+/, 'Email is not valid'],
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'vip', 'admin',],
        default: 'user'
    },
    phone_number: {
        type: String,
        unique: true,
        required: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Phone number is not valid'],
    },
    avatar: {
        data: Buffer,
        contentType: String,
    },
    AIO_USERNAME: {
        type: String,
        required: true,
    },
    AIO_KEY: {
        type: String,
        required: true,
    },
    webServerIp: {
        type: String,
    },
    accessToken: {
        type: String,
    },
    refreshToken: {
        type: String,
    },
});

module.exports = mongoose.model('Users', Users, 'Users');
