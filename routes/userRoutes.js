// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const multer = require('multer');
const { 
    updateUserProfile, 
    getUserProfile, 
    getAllUsers, 
    deleteUserProfile, 
    getStudentsByBatch, 
    getAllUsersExceptStudents,
    getFeesByBatch,
    getUserBatches,
    searchUsers  // Import the searchUsers controller
} = require("../controllers/userController");
const { uploadFile } = require("../controllers/fileController");
const { auth } = require("../middlewares/authMiddleware");

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// ==================== User Management Routes ==================== //

// Update a user profile by ID (Admin only)
router.put("/profile/:userId", auth(["admin"]), updateUserProfile);  

// Get user profile by ID (Admin or Teacher only)
router.get("/profile/:userId", auth(["admin", "teacher"]), getUserProfile);  

router.get("/batches/:userId", auth(["admin", "teacher"]), getUserBatches);

// Get all user profiles or filter by role if provided (Admin only)
router.get("/profiles/:role", auth(["admin"]), getAllUsers);  

// Delete a user profile by ID (Admin only)
router.delete("/profile/:userId", auth(["admin"]), deleteUserProfile);

// Get students by batch ID (Admin or Teacher only)
router.get('/batch/:batchid/students', auth(["admin", "teacher"]), getStudentsByBatch);  

// Get students by batch ID with fee information (Admin only)
router.get('/batch/:batchid/studentswithfees', auth(["admin"]), getFeesByBatch);  

// Upload a file (Admin only)
router.post("/upload", auth(["admin"]), upload.single('file'), uploadFile);  

// Get all users except students (Admin only)
router.get("/staff/profiles", auth(["admin"]), getAllUsersExceptStudents);  

// Search users by name, email, batch, studentId, and role (Admin only)
router.get("/search-users", auth(["admin","teacher"]), searchUsers);  


module.exports = router;
