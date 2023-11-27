const express = require('express');
const userRouter = require('./user');
const authRouter = require('./auth');
const paymentRouter = require('./payments');
const trackRouter = require('./track');
const locationRouter = require('./location');
const eventRouter = require('./event');
const tapeRouter = require('./tape');

const v1Router = express.Router();

v1Router.use('/tape', tapeRouter);
v1Router.use('/event', eventRouter);
v1Router.use('/location', locationRouter);
v1Router.use('/user', userRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/payment', paymentRouter);
v1Router.use('/track', trackRouter);

module.exports = v1Router;
