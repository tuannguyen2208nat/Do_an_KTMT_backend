require('dotenv').config()
var createError = require('http-errors');
var express = require('express');

const configViewEngine = require('./config/viewEngine');
const database = require('./config/database');
const mqttClient = require('./config/mqttHelper');
var usersRouter = require('./routes/userRoutes');


const app = express()

app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
const hostname = process.env.HOST_NAME;

configViewEngine(app)

database.connect();
mqttClient.connect();


app.use('/', usersRouter);

app.listen(port, hostname, () => {
  console.log(`Example app listening on port ${port}`)
});

module.exports = app;
