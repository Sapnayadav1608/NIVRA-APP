const express = require('express');
const router = express.Router();

// Example controller function
const getExampleData = (req, res) => {
    res.status(200).json({ message: 'Example data retrieved successfully' });
};

// Define routes
router.get('/example', getExampleData);

// Export the router
module.exports = router;