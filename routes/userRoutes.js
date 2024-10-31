// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const { 
    updateUserProfile, 
    getUserProfile, 
    getAllUsers, 
    deleteUserProfile, 
    getStudentsByBatch, 
    getAllUsersExceptStudents,
    getFeesByBatch
} = require("../controllers/userController");
const { uploadFile } = require("../controllers/fileController");
const { auth } = require("../middlewares/authMiddleware");
const multer = require('multer');

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// User Management Routes - Admin Only
router.put("/profile/:userId", auth(["admin"]), updateUserProfile);  // Update a user profile by ID
router.get("/profile/:userId", auth(["admin","teacher"]), getUserProfile);     // Get user profile by ID
router.get("/profiles/:role", auth(["admin"]), getAllUsers);         // Get all user profiles or filter by role if provided
router.delete("/profile/:userId", auth(["admin"]), deleteUserProfile);
router.get('/batch/:batchid/students', auth(["admin", "teacher"]), getStudentsByBatch); // Get students by batch ID
router.get('/batch/:batchid/studentswithfees', auth(["admin"]), getFeesByBatch); // Get students by batch ID with fee info
router.post("/upload", auth(["admin"]), upload.single('file'), uploadFile); // Upload file
router.get("/staff/profiles", auth(["admin"]), getAllUsersExceptStudents);  // Get all users except students

module.exports = router;
