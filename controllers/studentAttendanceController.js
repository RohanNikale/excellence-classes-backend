// controllers/attendanceController.js
const Attendance = require("../models/studentAttendanceModel");
const User = require("../models/userModel");

// Mark Attendance
// Mark Attendance
exports.markAttendance = async (req, res) => {
  const { studentId, status, date } = req.body;

  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== "student" || (student.status !== "active" && student.status !== "re-enrolled")) {
      return res.status(404).json({ message: "Student not found or not eligible" });
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
      if (!student || student.role !== "student" || (student.status !== "active" && student.status !== "re-enrolled")) {
        return { studentId, error: "Student not found or not eligible" };
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

  try {
    // Check if the date parameter is provided
    const { date, batch } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date query parameter is required." });
    }

    // Parse and validate the date
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD format." });
    }

    // Standardize date to midnight
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    // First, retrieve attendance records based on date, limiting the populated fields
    let attendanceRecords = await Attendance.find({
      date: { $gte: targetDate, $lt: nextDay },
    }).populate({
      path: 'student',
      select: 'name batch', // Only fetch name and batch ID from student
      populate: {
        path: 'batch', // Populate the batch info
        select: '_id name' // Only fetch the batch ID and name
      }
    });

    // If batch parameter is provided, filter attendance records by batch ID
    if (batch) {
      attendanceRecords = attendanceRecords.filter(record =>
        record.student.batch && record.student.batch._id.toString() === batch
      );
    }

    // Map to only return the necessary fields, including the status
    const response = attendanceRecords.map(record => ({
      studentName: record.student.name,
      batchId: record.student.batch ? record.student.batch._id : null,
      batchName: record.student.batch ? record.student.batch.name : null,
      status: record.status, // Include the status field
      date: record.date, // Include the date for reference
    }));

    res.status(200).json(response);
  } catch (err) {
    // Log the error for debugging
    console.error("Error retrieving attendance by date and batch:", err);
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
