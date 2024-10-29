// routes/attendanceRoutes.js
const express = require("express");
const router = express.Router();
const {
  markAttendance,
  markBulkAttendance ,
  getAllAttendance,
  getAttendanceByStudent,
  updateAttendance,
  getAllAttendanceSortedByDate 
} = require("../controllers/attendanceController");
const { auth } = require("../middlewares/authMiddleware");

// Mark attendance - accessible to teacher or admin
router.post("/mark", auth(["teacher", "admin"]), markAttendance);
// Get all students' attendance records sorted by date (Admin or Teacher)
router.get("/all-by-date", auth(["admin", "teacher"]), getAllAttendanceSortedByDate);

// Bulk attendance route
router.post("/bulk-mark", auth(["admin", "teacher"]), markBulkAttendance);
// Get all attendance records - accessible to admin and teacher
router.get("/all", auth(["teacher", "admin"]), getAllAttendance);

// Get attendance by student ID - accessible to the specific student, teacher, or admin
router.get("/:studentId", auth(["student", "teacher", "admin"]), getAttendanceByStudent);

// Update attendance - accessible to admin and teacher
router.put("/update", auth(["teacher", "admin"]), updateAttendance);

module.exports = router;
