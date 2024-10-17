require('dotenv').config();
var express = require('express');
var cors = require('cors');
var bullBoardRouter = require('./queue/bullBoard')

const database = require('./config/Database');
const routes = require('./routes/Routes');

const port = process.env.PORT || 3001;
const hostname = process.env.HOST_NAME;

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/admin/queues', bullBoardRouter);
app.use('/', routes);


database.connect();

app.listen(port, hostname, () => {
    console.log(`Listening on port ${port}`);
});

module.exports = app;
