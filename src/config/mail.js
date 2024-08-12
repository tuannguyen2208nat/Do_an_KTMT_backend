const nodeMailer = require('nodemailer');
const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: "mailrac467@gmail.com",
        pass: "tdvc ugmf fapd mqvc"
    }
})
module.exports = transporter