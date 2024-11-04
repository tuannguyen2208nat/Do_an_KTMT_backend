const Firmware = require('../models/Firmware');
const modelUser = require('../models/Users');

const upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const size = `${(req.file.size / 1024).toFixed(2)} KB`;
        const newFirmware = new Firmware({
            userID: req.user.id,
            file: {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            },
            version: req.body.version,
            size: size,
        });
        await newFirmware.save();
        return res.status(200).json('Upload success');
    } catch (error) {
        console.error('Error saving firmware:', error);
        return res.status(500).json({
            error: 'Server error',
        });
    }
};

const downloadFile = async (req, res) => {
    const { version } = req.body;
    try {
        const user = await modelUser.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const firmware = await Firmware.findOne({ version });
        if (!firmware) {
            return res.status(404).json({ message: 'Firmware not found' });
        }
        const fileBuffer = firmware.file.data;
        const fileName = `firmware_${version}`;
        const contentType = firmware.file.contentType;
        res.set({
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Type': contentType,
        });
        return res.send(fileBuffer);
    } catch (error) {
        console.error('Error downloading firmware:', error);
        return res.status(500).json({
            error: 'Server error',
        });
    }
};

const getVersions = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await modelUser.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const firmwares = await Firmware.find({}, 'version size');
        const versions = firmwares.map(firmware => ({
            version: firmware.version,
            size: firmware.size
        }));
        return res.status(200).json(versions);
    } catch (error) {
        console.error('Error retrieving firmware versions:', error);
        return res.status(500).json({
            error: 'Server error',
        });
    }
};

module.exports = { upload, downloadFile, getVersions };