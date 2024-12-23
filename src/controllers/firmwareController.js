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
        if (board !== "Yolo Uno" && board !== "Relay 6ch") {
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
    const { board } = req.body;
    try {
        if (!board) {
            return res.status(400).json({ message: 'Board is required' });
        }
        if (board !== "Yolo Uno" && board !== "Relay 6ch") {
            return res.status(400).json({ message: 'Invalid board type.' });
        }
        const firmware = await Firmware.findOne({ board: board })
            .sort({ version: -1 })
            .exec();

        if (!firmware) {
            return res.status(404).json({ message: 'Firmware not found' });
        }

        const fileBuffer = firmware.file.data;
        const fileName = `firmware_${firmware.version}`;
        const contentType = firmware.file.contentType;
        const fileSize = firmware.size;
        res.set({
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Type': contentType,
        });

        return res.status(200).json({
            file: fileBuffer.toString('base64'),
            size: fileSize,
            contentType: contentType,
            version: firmware.version,
        });
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
        const { board } = req.body;
        if (!board) {
            return res.status(400).json({ message: 'Board is required' });
        }
        if (board !== "Yolo Uno" && board !== "Relay 6ch") {
            return res.status(400).json({ message: 'Invalid board type.' });
        }
        const latestFirmware = await Firmware.findOne({ board })
            .sort({ version: -1 })
            .select('version size');

        if (!latestFirmware) {
            return res.status(404).json({ message: 'No firmware found for this board type.' });
        }
        return res.status(200).json({
            version: latestFirmware.version,
            size: latestFirmware.size,
        });
    } catch (error) {
        console.error('Error retrieving firmware versions:', error);
        return res.status(500).json({
            error: 'Server error',
        });
    }
};

module.exports = { upload, downloadFile, getVersions };