const express = require('express');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const checkAdmin = require('../middlewares/checkRole');
const authenticateToken = require('../middlewares/authenticateToken');

const emailQueue = require('./emailQueue');
const logQueue = require('./logQueue');
const sensorQueue = require('./sensorQueue');


const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: [
        new BullAdapter(emailQueue),
        new BullAdapter(logQueue),
        new BullAdapter(sensorQueue),

    ],
    serverAdapter: serverAdapter,
});

const router = serverAdapter.getRouter();
const adminQueueRouter = express.Router();

adminQueueRouter.use(authenticateToken);
adminQueueRouter.use(checkAdmin);
adminQueueRouter.use(router);

module.exports = adminQueueRouter;
