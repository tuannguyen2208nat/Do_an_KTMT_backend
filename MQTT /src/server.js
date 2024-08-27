require('dotenv').config();
var express = require('express');
var cors = require('cors');

const configViewEngine = require('./config/viewEngine');
const database = require('./config/database');
const index = require('./routes/index');

const port = process.env.PORT || 3001;
const hostname = process.env.HOST_NAME;

const app = express();

app.use(express.json());
app.use(cors());
app.use('/', index);
app.use(express.urlencoded({ extended: true }));// Middleware to parse URL-encoded bodies

configViewEngine(app);
database.connect();

app.listen(port, hostname, () => {
    console.log(`Listening on port ${port}`);
});

module.exports = app;
