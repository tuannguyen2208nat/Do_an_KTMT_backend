require('dotenv').config();
var express = require('express');
var cors = require('cors');
var adminQueueRouter = require('./queue/bullBoard')
var mqttController = require('./connect/mqttController')

const database = require('./config/database');
const routes = require('./routes/Routes');

const port = process.env.PORT || 3001;
const hostname = process.env.HOST_NAME;

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/admin/queues', adminQueueRouter);
app.use('/', routes);

database.connect();

mqttController.connectAllUsers();

app.listen(port, hostname, () => {
    console.log(`Listening on port ${port}`);
});



module.exports = app;
