const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FirmwareSchema = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    file: {
        data: { type: Buffer, required: true },
        contentType: { type: String, required: true },
    },
    version: {
        type: String,
        required: true,
        unique: true,
    },
    size: {
        type: String,
        required: true,
    },
});

FirmwareSchema.pre('save', function (next) {
    const validUserID = '66c38bb86a798188855a88ea';
    if (this.userID.toString() !== validUserID) {
        const err = new Error('Cannot upload firmware');
        err.statusCode = 403;
        return next(err);
    }
    next();
});

module.exports = mongoose.model('Firmwares', FirmwareSchema, 'Firmwares');
