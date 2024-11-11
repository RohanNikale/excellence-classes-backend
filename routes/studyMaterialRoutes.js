const express = require('express');
const studyMaterialController = require('../controllers/studyMaterialController');
const { auth } = require('../middlewares/authMiddleware');

const router = express.Router();

// Study Material Management Routes
router.post('/', auth(['admin', 'teacher']), studyMaterialController.createStudyMaterial); // Create new study material
router.get('/:batch', auth(['admin', 'teacher', 'student']), studyMaterialController.getAllStudyMaterials); // Get all study materials
router.get('/materialid/:id', auth(['admin', 'teacher', 'student']), studyMaterialController.getStudyMaterialById); // Get study material by ID
router.put('/:id', auth(['admin', 'teacher']), studyMaterialController.updateStudyMaterial); // Update study material by ID
router.delete('/:id', auth(['admin', 'teacher']), studyMaterialController.deleteStudyMaterial); // Delete study material by ID
router.get('/subject/:subject', auth(['admin', 'teacher', 'student']), studyMaterialController.getStudyMaterialsBySubject); // Get study materials by subject
router.get('/batch/:batchId', auth(['admin', 'teacher', 'student']), studyMaterialController.getStudyMaterialsByBatch); // Get study materials by batch

module.exports = router;