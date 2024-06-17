const express = require('express');
const userRouter = require('./routes/users.js'); 

module.exports = () => {
    const app = express();

    app.use(express.json());
    app.use(userRouter);

    return app;
};