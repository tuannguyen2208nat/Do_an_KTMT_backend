require('dotenv').config();
const WebSocket = require('ws');
const TemperatureSensor = require('../models/TemperatureSensors');
const HumiditySensor = require('../models/HumiditySensors');
const Location = require('../models/Location');
const modelUser = require('../models/Users');

let client = null;
let connected = false;

// Thiết lập kết nối WebSocket
const connect = async (req, res) => {
    if (connected) {
        return res.status(200).json({ message: 'Already connected to MQTT' });
    }
    const userId = req.user.id;
    const user = await modelUser.findById(userId).exec();
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const webServerIp = user.webServerIp;
    const wsUrl = "ws://" + webServerIp + "/ws";

    try {
        client = new WebSocket(wsUrl);

        client.on('open', () => {
            connected = true;
            console.log('Đã kết nối đến WebSocket server');
            res.status(200).json({ message: 'Kết nối thành công' });
        });

        client.on('message', (message) => {
            if (Buffer.isBuffer(message)) {
                message = message.toString();
                console.log('Dữ liệu từ WebSocket:', message);
            }
            try {
                const data = JSON.parse(message);
                if (data.temperature !== undefined) {
                    console.log(`Temperature data received: ${data.temperature}°C`);
                    const tempData = new TemperatureSensor({
                        userID: userId,
                        data: parseFloat(data.temperature),
                        Date: new Date(),
                    });
                    tempData.save();
                    console.log('Temperature data saved to MongoDB');
                }

                if (data.humidity !== undefined) {
                    console.log(`Humidity data received: ${data.humidity}%`);
                    const humidityData = new HumiditySensor({
                        userID: userId,
                        data: parseFloat(data.humidity),
                        Date: new Date(),
                    });
                    humidityData.save();
                    console.log('Humidity data saved to MongoDB');
                }

                if (data.location !== undefined) {
                    console.log(`Location data received: ${data.location}`);
                    const [X, Y] = data.location.split('-');
                    const locationData = new Location({
                        userID: userId,
                        X: X,
                        Y: Y,
                        Date: new Date(),
                    });
                    locationData.save();
                    console.log('Location data saved to MongoDB');
                }

            } catch (error) {
                console.error('Error processing message:', error);
            }

        });

        client.on('close', () => {
            connected = false;
            console.log('Kết nối WebSocket đã đóng');
        });

        client.on('error', (error) => {
            console.error('Lỗi WebSocket:', error);
            res.status(500).json({ message: 'Lỗi kết nối WebSocket' });
        });
    } catch (error) {
        console.error('Lỗi khi kết nối WebSocket:', error);
        res.status(500).json({ message: 'Lỗi khi kết nối WebSocket' });
    }
};


const publishdata = (req, res, next) => {
    if (!connected) {
        return res.status(400).json({ message: 'Chưa kết nối' });
    }

    const data = req.body;
    const relayId = data.relay_id;
    const state = data.state;
    try {
        var status;
        if (!state) {
            status = "ON";
        } else {
            status = "OFF";
        }
        const jsonData = JSON.stringify({
            index: relayId,
            state: status
        });
        client.send(jsonData);
        res.status(200).json({ message: 'Dữ liệu đã được gửi' });
    } catch (error) {
        console.error('Lỗi khi gửi dữ liệu qua WebSocket:', error);
        res.status(500).json({ message: 'Lỗi khi gửi dữ liệu qua WebSocket' });
    }
};


const disconnect = (req, res) => {
    if (!connected) {
        return res.status(400).json({ message: 'Chưa kết nối' });
    }

    try {
        client.close();
        connected = false;
        res.status(200).json({ message: 'Đã ngắt kết nối' });
    } catch (error) {
        console.error('Lỗi khi ngắt kết nối WebSocket:', error);
        res.status(500).json({ message: 'Lỗi khi ngắt kết nối WebSocket' });
    }
};

module.exports = {
    connect,
    publishdata,
    disconnect,
};
