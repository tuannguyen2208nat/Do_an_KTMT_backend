const mongoose = require('mongoose');

const atlas = "mongodb+srv://DO_AN_KTMT:Doanktmt123.@cluster0.wsm9t.mongodb.net/myDB?retryWrites=true&w=majority&appName=Cluster0";

const connect = async () => {
    try {
        await mongoose.connect(atlas);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

module.exports = { connect };
