// bullBoard.js
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const emailQueue = require('./emailqueue');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: [
        new BullAdapter(emailQueue),
    ],
    serverAdapter: serverAdapter,
});

module.exports = serverAdapter.getRouter();
