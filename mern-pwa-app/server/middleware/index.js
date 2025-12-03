const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const middleware = express.Router();

// Security middleware
middleware.use(helmet());

// Logging middleware
middleware.use(morgan('dev'));

// Custom error handling middleware
middleware.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = middleware;