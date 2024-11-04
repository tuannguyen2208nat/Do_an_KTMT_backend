const Firmware = require('../models/Firmware');
const modelUser = require('../models/Users');

const upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const { board, version } = req.body;
        if (!board || !version) {
            return res.status(400).json({ message: 'Board and version are required' });
        }
        if (board !== "yolo uno" && board !== "relay 6ch") {
            return res.status(400).json({ message: 'Invalid board type.' });
        }
        const existingFirmware = await Firmware.findOne({ board: board, version: version });
        if (existingFirmware) {
            return res.status(400).json({ message: `Version already exists for this ${board}` });
        }
        const size = `${(req.file.size / 1024).toFixed(2)} KB`;
        const newFirmware = new Firmware({
            userID: req.user.id,
            board: board,
            file: {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            },
            version: version,
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
    const { board, version } = req.body;
    try {
        if (!board || !version) {
            return res.status(400).json({ message: 'Board and version are required' });
        }
        const user = await modelUser.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (board !== "yolo uno" && board !== "relay 6ch") {
            return res.status(400).json({ message: 'Invalid board type.' });
        }
        const firmware = await Firmware.findOne({ board: board, version: version });
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
        const { board } = req.body;
        if (!board) {
            return res.status(400).json({ message: 'Board is required' });
        }
        if (board !== "yolo uno" && board !== "relay 6ch") {
            return res.status(400).json({ message: 'Invalid board type.' });
        }
        const firmwares = await Firmware.find({ board: board }, 'version size');
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