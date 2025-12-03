const express = require('express');
const router = express.Router();

// Import controllers
const exampleController = require('../controllers/index');

// Define API routes
router.get('/example', exampleController.getExample);
router.post('/example', exampleController.createExample);

// Export the router
module.exports = router;