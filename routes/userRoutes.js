// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { 
    updateUserProfile, 
    getUserProfile, 
    getAllUsers, 
    deleteUserProfile 
} = require("../controllers/userController");
const {uploadFile}=require("../controllers/fileController");
const { auth } = require("../middlewares/authMiddleware");
const multer = require('multer');
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });
// User Management Routes - Admin Only
router.put("/profile/:userId", auth(["admin"]), updateUserProfile);  // Update a user profile by ID
router.get("/profile/:userId", auth(["admin"]), getUserProfile);     // Get user profile by ID
router.get("/profiles", auth(["admin"]), getAllUsers);               // Get all user profiles
router.delete("/profile/:userId", auth(["admin"]), deleteUserProfile);      // Delete a user profile by ID
router.post("/upload", auth(["admin"]), upload.single('file'), uploadFile);      // Delete a user profile by ID

module.exports = router;
