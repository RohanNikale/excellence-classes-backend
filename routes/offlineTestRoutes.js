const express = require('express');
const offlineTestController = require('../controllers/offlineTestController');
const { auth } = require('../middlewares/authMiddleware');

const router = express.Router();

// Offline Test Management Routes
router.post('/tests/createOfflineTest', auth(['admin', 'teacher']), offlineTestController.createTest); // Create a new offline test (Admin/Teacher only)
router.put('/tests/:id', auth(['admin']), offlineTestController.updateTest); // Update a test by ID (Admin only)
router.delete('/tests/:id', auth(['admin', 'teacher']), offlineTestController.deleteTest); // Delete a test by ID (Admin/Teacher)
router.get('/tests', auth(['admin', 'student', 'teacher']), offlineTestController.getAllOfflineTests); // Get all tests (Admin/Teacher/Student)
router.get('/tests/:testId', auth(['admin', 'student', 'teacher']), offlineTestController.getTestById); // Get a specific test by ID (Admin/Teacher/Student)

module.exports = router;
