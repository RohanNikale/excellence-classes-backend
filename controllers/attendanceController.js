// controllers/attendanceController.js
const Attendance = require("../models/attendanceModel");
const User = require("../models/userModel");

// Mark Attendance
exports.markAttendance = async (req, res) => {
  const { studentId, status, date } = req.body;

  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // If a date is provided, use it; otherwise, set to today at midnight
    const attendanceDate = date ? new Date(new Date(date).setHours(0, 0, 0, 0)) : new Date(new Date().setHours(0, 0, 0, 0));

    // Check if attendance for the student on the specified date already exists
    let attendance = await Attendance.findOne({ student: studentId, date: attendanceDate });

    if (attendance) {
      // Update existing attendance status
      attendance.status = status;
      attendance.markedBy = req.user.id;
      await attendance.save();
      return res.status(200).json({ message: "Attendance updated successfully", attendance });
    } else {
      // Create new attendance record
      attendance = new Attendance({
        student: studentId,
        status,
        markedBy: req.user.id,
        date: attendanceDate
      });
      await attendance.save();
      return res.status(201).json({ message: "Attendance marked successfully", attendance });
    }
  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark Bulk Attendance for Multiple Students
exports.markBulkAttendance = async (req, res) => {
  const { attendances } = req.body;

  if (!Array.isArray(attendances) || attendances.length === 0) {
    return res.status(400).json({ message: "Invalid input: 'attendances' must be a non-empty array." });
  }

  try {
    const bulkOperations = attendances.map(async ({ studentId, status, date }) => {
      const student = await User.findById(studentId);
      if (!student || student.role !== "student") {
        return { studentId, error: "Student not found" };
      }

      // Set attendance date to provided date or default to today at midnight
      const attendanceDate = date ? new Date(new Date(date).setHours(0, 0, 0, 0)) : new Date(new Date().setHours(0, 0, 0, 0));

      // Check if attendance record already exists for specified date
      let attendance = await Attendance.findOne({ student: studentId, date: attendanceDate });

      if (attendance) {
        // Update existing attendance status
        attendance.status = status;
        attendance.markedBy = req.user.id;
        await attendance.save();
        return { studentId, message: "Attendance updated" };
      } else {
        // Create new attendance record
        attendance = new Attendance({
          student: studentId,
          status,
          markedBy: req.user.id,
          date: attendanceDate
        });
        await attendance.save();
        return { studentId, message: "Attendance marked" };
      }
    });

    const results = await Promise.all(bulkOperations);
    res.status(200).json({ message: "Bulk attendance processed", results });
  } catch (err) {
    console.error("Error in bulk attendance marking:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Students Attendance Sorted by Date
exports.getAllAttendanceSortedByDate = async (req, res) => {
  console.log("Received date parameter:", req.query.date);
  try {
    // Check if the date parameter is provided
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date query parameter is required." });
    }

    // Try to parse the date; if invalid, catch the error
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD format." });
    }

    // Standardize date to midnight
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    // Attempt to retrieve attendance records
    const attendanceRecords = await Attendance.find({
      date: { $gte: targetDate, $lt: nextDay }
    }).populate("student", "name");

    res.status(200).json(attendanceRecords);
  } catch (err) {
    // Log the error for debugging
    console.error("Error retrieving attendance by date:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Get All Attendance Records - Only for admin and teacher
exports.getAllAttendance = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "teacher") {
      return res.status(403).json({ message: "Access denied: Admins and teachers only" });
    }

    const attendanceRecords = await Attendance.find().populate("student", "name").sort({ date: -1 });
    res.status(200).json(attendanceRecords);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Attendance by Student ID - Only for authorized user
exports.getAttendanceByStudent = async (req, res) => {
  const { studentId } = req.params;

  try {
    if (req.user.role === "student" && req.user.id !== studentId) {
      return res.status(403).json({ message: "Access denied: You can only view your own attendance records." });
    }

    const attendanceRecords = await Attendance.find({ student: studentId }).populate("student", "name").sort({ date: -1 });
    res.status(200).json(attendanceRecords);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Attendance - Only for admin and teacher
exports.updateAttendance = async (req, res) => {
  const { attendanceId, status } = req.body;

  try {
    if (req.user.role !== "admin" && req.user.role !== "teacher") {
      return res.status(403).json({ message: "Access denied: Admins and teachers only" });
    }

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    attendance.status = status;
    await attendance.save();

    res.status(200).json({ message: "Attendance updated successfully", attendance });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
