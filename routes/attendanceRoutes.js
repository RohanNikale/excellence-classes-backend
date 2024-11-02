// routes/attendanceRoutes.js
const express = require("express");
const router = express.Router();
const {
  markAttendance,
  markBulkAttendance,
  getAllAttendance,
  getAttendanceByStudent,
  updateAttendance,
  getAllAttendanceSortedByDate,
} = require("../controllers/studentAttendanceController");
const { markStaffAttendance, markBulkStaffAttendance, getAllStaffAttendanceSortedByDate, getAllStaffAttendance, getStaffAttendanceById, updateStaffAttendance } = require("../controllers/staffAttendanceController");

const { auth } = require("../middlewares/authMiddleware");

// Student Attendance Routes
router.post("/mark", auth(["teacher", "admin"]), markAttendance);
router.post("/bulk-mark", auth(["admin", "teacher"]), markBulkAttendance);
router.get("/all-by-date", auth(["admin", "teacher"]), getAllAttendanceSortedByDate);
router.get("/all", auth(["teacher", "admin"]), getAllAttendance);
router.get("/:studentId", auth(["student", "teacher", "admin"]), getAttendanceByStudent);
router.put("/update", auth(["teacher", "admin"]), updateAttendance);

// Staff Attendance Routes
router.post("/staff/mark", auth(["admin"]), markStaffAttendance);
router.post("/staff/bulk-mark", auth(["admin"]), markBulkStaffAttendance);
router.get("/staff/all-by-date", auth(["admin"]), getAllStaffAttendanceSortedByDate);
router.get("/staff/all", auth(["admin"]), getAllStaffAttendance);
router.get("/staff/:staffId", auth(["teacher","admin"]), getStaffAttendanceById);
router.put("/staff/update", auth(["admin"]), updateStaffAttendance);

module.exports = router;
