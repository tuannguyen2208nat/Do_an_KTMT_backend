require('dotenv').config();
var express = require('express');
var cors = require('cors');

const configViewEngine = require('./config/viewEngine');
const database = require('./config/database');
const mqttClient = require('./controllers/mqttController');
var usersRouter = require('./routes/userRoutes');
var sensorRoutes = require('./routes/sensorRoutes');
var mqttRoutes = require('./routes/mqttRoutes');

const app = express();

app.use(express.json());
app.use(cors());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
const hostname = process.env.HOST_NAME;

configViewEngine(app);

database.connect();
mqttClient.connect();

app.use('/', usersRouter);
app.use('/sensor', sensorRoutes);
app.use('/mqtt', mqttRoutes);

app.listen(port, hostname, () => {
    console.log(`Listening on port ${port}`);
});

module.exports = app;
