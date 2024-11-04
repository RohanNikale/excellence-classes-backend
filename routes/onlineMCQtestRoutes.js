// routes/onlineMCQTestRoutes.js
const express = require('express');
const onlineMCQTestController = require('../controllers/OnlineMCQTestController');
const { auth } = require('../middlewares/authMiddleware');

const router = express.Router();

// Online MCQ Test Management Routes - Admin Only
router.post('/tests/createMCQTest', auth(['admin','teacher']), onlineMCQTestController.createMCQTest); // Create a new MCQ test
router.put('/tests/:id', auth(['admin']), onlineMCQTestController.updateTest); // Update a test by ID
router.delete('/tests/:id', auth(['admin']), onlineMCQTestController.deleteTest); // Delete a test by ID
router.get('/tests', auth(['admin']), onlineMCQTestController.getAllTests); // Get all tests
router.get('/tests/:id', auth(['admin','student','teacher']), onlineMCQTestController.getTestById); // Get a test by ID

module.exports = router;
