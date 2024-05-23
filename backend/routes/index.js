const express = require('express');
const userRouter = require('./user');

// Single routing
const router = express.Router();
router.use('/user', userRouter);

module.exports = router;