require('dotenv').config();
const mongoose = require('mongoose');
const atlas =
    'mongodb+srv://' +
    process.env.DATABASE_NAME +
    ':' +
    process.env.DATABASE_PASSWORD +
    '@cluster0.wsm9t.mongodb.net/myDB';

const connect = async () => {
    try {
        await mongoose.connect(atlas);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

module.exports = { connect };
