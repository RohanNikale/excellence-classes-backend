// authRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/userModel")
const { registerUser, loginUser } = require("../controllers/authController");
const { auth } = require("../middlewares/authMiddleware");

router.post("/register", auth(["admin"]), registerUser);
router.post("/login", loginUser);

// Protected Route Example (e.g., Admin-only)
router.get("/profile", auth(["admin","student", "teacher"]), async(req, res) => {
  try {
    // Populate the batch and its related standard field
    const userProfile = await User.findById(req.user._id)
      .populate({
        path: 'batch',
        populate: { path: 'standard' } // Populate standard inside batch
      })
      .select('-password -standard'); // Exclude password from the response

    if (!userProfile) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ profile: userProfile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get("/admin-data", auth(["admin"]), (req, res) => {
  res.json({ message: "Admin access granted" });
});

router.get("/teacher-data", auth(["admin","teacher"]), (req, res) => {
  res.json({ message: "Director access granted" });
});

// Access for students and teachers
router.get("/student-data", auth(["admin","student", "teacher"]), (req, res) => {
  res.json({ message: "Student or teacher access granted" });
});

module.exports = router;
