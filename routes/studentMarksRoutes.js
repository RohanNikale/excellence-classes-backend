// routes/studentMarksRoutes.js
const express = require('express');
const studentMarksController = require('../controllers/studentMarksController');
const { auth } = require('../middlewares/authMiddleware');

const router = express.Router();

// Student Marks Management Routes
router.post('/bulk/marks/:testId', auth(['admin', 'teacher']), studentMarksController.bulkAddStudentMarks); // Add new student marks record
router.post('/marks', auth(['admin', 'teacher','student']), studentMarksController.addStudentMarks); // Add new student marks record
router.get('/marks/student/:studentId', auth(['admin', 'student', 'teacher']), studentMarksController.getStudentMarksByStudentId); // Get all marks for a specific student
router.put('/marks/:id', auth(['admin', 'teacher']), studentMarksController.updateStudentMarks); // Update student marks by record ID
router.delete('/marks/:id', auth(['admin', 'teacher']), studentMarksController.deleteStudentMarks); // Soft delete a student marks record by ID
router.get('/marks/:testId', auth(['admin', 'teacher','student']), studentMarksController.getStudentMarksByTestId); // Get all student marks records with optional filters

module.exports = router;
