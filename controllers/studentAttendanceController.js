// controllers/attendanceController.js
const Attendance = require("../models/studentAttendanceModel");
const User = require("../models/userModel");
const sendWhatsAppAbsentNotification = require('../middlewares/sendWhatsAppAbsentNotificationMiddleware')
// Helper function to adjust student's attendance count based on status change
function adjustStudentAttendanceCounts(student, status, increment) {
  switch (status) {
    case "present":
      student.attendanceCounts.present += increment;
      break;
    case "late":
      student.attendanceCounts.late += increment;
      break;
    case "absent":
      student.attendanceCounts.absent += increment;
      break;
    case "Absent(Informed)":
      student.attendanceCounts["Absent(Informed)"] += increment;
      break;
    default:
      break;
  }
}

// Helper function to calculate the score based on attendance counts
function calculateStudentScore(student) {
  const presentScore = student.attendanceCounts.present * 1;
  const lateScore = student.attendanceCounts.late * 0.5;
  const absentScore = student.attendanceCounts.absent * 0;
  const informedAbsentScore = student.attendanceCounts["Absent(Informed)"] * 0.75;

  student.attendanceScore = presentScore + lateScore + absentScore + informedAbsentScore;
}

// Mark Attendance for a single student
exports.markAttendance = async (req, res) => {
  const { studentId, status, date } = req.body;

  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== "student" || !["active", "re-enrolled"].includes(student.status)) {
      return res.status(404).json({ message: "Student not found or inactive" });
    }

    const attendanceDate = date ? new Date(new Date(date).setHours(0, 0, 0, 0)) : new Date(new Date().setHours(0, 0, 0, 0));

    let attendance = await Attendance.findOne({ student: studentId, date: attendanceDate });

    if (attendance) {
      // Adjust attendance count for the previous status
      adjustStudentAttendanceCounts(student, attendance.status, -1);

      // Update attendance with the new status
      attendance.status = status;
      attendance.markedBy = req.user.id;
      await attendance.save();
    } else {
      // New attendance record
      attendance = new Attendance({
        student: studentId,
        status,
        markedBy: req.user.id,
        date: attendanceDate
      });
      await attendance.save();
    }

    // Adjust attendance count for the new status and calculate the updated score
    adjustStudentAttendanceCounts(student, status, 1);
    calculateStudentScore(student);
    await student.save();

    return res.status(attendance ? 200 : 201).json({
      message: attendance ? "Attendance updated successfully" : "Attendance marked successfully",
      attendance
    });
  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark Bulk Attendance for multiple students
exports.markBulkAttendance = async (req, res) => {
  const { attendances } = req.body;
  console.log(attendances)
  if (!Array.isArray(attendances) || attendances.length === 0) {
    return res.status(400).json({ message: "Invalid input: 'attendances' must be a non-empty array." });
  }

  try {
    const bulkOperations = attendances.map(async ({ studentId, status, date }) => {
      const student = await User.findById(studentId)
        .populate({
          path: "batch",
          select: "name standard",
          populate: {
            path: "standard",
            select: "name"
          }
        });
      // console.log(student.parentContactNumber)
      if (status === 'absent') {
        sendWhatsAppAbsentNotification(`+91${student.parentContactNumber}`,"Parent",student.name,`${student.batch.standard.name} From ${student.batch.name}`,date)
      }

      if (!student || student.role !== "student" || !["active", "re-enrolled"].includes(student.status)) {
        return { studentId, error: "Student not found or inactive" };
      }

      const attendanceDate = date ? new Date(new Date(date).setHours(0, 0, 0, 0)) : new Date(new Date().setHours(0, 0, 0, 0));
      let attendance = await Attendance.findOne({ student: studentId, date: attendanceDate });

      if (attendance) {
        // Adjust attendance count for the previous status
        adjustStudentAttendanceCounts(student, attendance.status, -1);

        // Update attendance with the new status
        attendance.status = status;
        attendance.markedBy = req.user.id;
        await attendance.save();
      } else {
        // New attendance record
        attendance = new Attendance({
          student: studentId,
          status,
          markedBy: req.user.id,
          date: attendanceDate
        });
        await attendance.save();
      }

      // Adjust attendance count for the new status and calculate the updated score
      adjustStudentAttendanceCounts(student, status, 1);
      calculateStudentScore(student);
      await student.save();

      return { studentId, message: attendance ? "Attendance updated" : "Attendance marked" };
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
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: "Date query parameter is required." });
  }

  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) {
    return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD format." });
  }

  // Set start and end times for the date range
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(targetDate.getDate() + 1);

  try {
    const attendanceRecords = await Attendance.find({
      date: { $gte: targetDate, $lt: nextDay },
    }).populate("student", "name status");

    // Filter records to include only active or re-enrolled students
    const response = attendanceRecords
      .filter(record => record.student && ["active", "re-enrolled"].includes(record.student.status))
      .map(record => ({
        studentName: record.student.name,
        status: record.status,
        date: record.date,
      }));

    res.status(200).json(response);
  } catch (err) {
    console.error("Error retrieving student attendance by date:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Attendance Records
exports.getAllAttendance = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find()
      .populate("student", "name status") // Include status field in population
      .sort({ date: -1 });

    // Filter records to include only active or re-enrolled students
    const response = attendanceRecords
      .filter(record => record.student.status && ["active", "re-enrolled"].includes(record.student.status));

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Attendance by Student ID
exports.getAttendanceByStudent = async (req, res) => {
  const { role } = req.user; // Assuming req.user is populated with user information
  const studentId = role === 'admin' || role === 'teacher' ? req.params.studentId : req.user._id;

  // Get page number from query parameters, default to 1
  const page = parseInt(req.query.page) || 1;
  const limit = 10; // Set the limit for records per page

  // Get date range from query parameters
  const { from, to } = req.query;
  const dateFilter = {};

  // If 'from' date is provided, add it to the dateFilter
  if (from) {
    dateFilter.$gte = new Date(from);
  }
  // If 'to' date is provided, add it to the dateFilter
  if (to) {
    dateFilter.$lte = new Date(to);
  }

  try {
    // Count total attendance records for pagination, applying date filter if provided
    const totalRecords = await Attendance.countDocuments({
      student: studentId,
      ...(Object.keys(dateFilter).length && { date: dateFilter })
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalRecords / limit);

    // Fetch attendance records with pagination and date filter
    const attendanceRecords = await Attendance.find({
      student: studentId,
      ...(Object.keys(dateFilter).length && { date: dateFilter })
    })
      .populate("student", "name status") // Include status field in population
      .populate("markedBy", "name role") // Populate markedBy field to include name
      .sort({ date: -1 })
      .skip((page - 1) * limit) // Skip records for previous pages
      .limit(limit); // Limit records to the specified limit

    // Filter to include only active or re-enrolled students
    const filteredRecords = attendanceRecords.filter(record =>
      record.student.status && ["active", "re-enrolled"].includes(record.student.status)
    );

    // Send response with attendance records and pagination info
    res.status(200).json({
      totalRecords,
      totalPages,
      currentPage: page,
      records: filteredRecords,
    });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};



// Update Attendance - Only for admin and certain users
exports.updateAttendance = async (req, res) => {
  const { attendanceId, status } = req.body;

  try {
    const attendance = await Attendance.findById(attendanceId).populate("student", "status");
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (!["active", "re-enrolled"].includes(attendance.student.status)) {
      return res.status(403).json({ message: "Cannot update attendance for inactive student" });
    }

    // Adjust attendance count for the previous status
    adjustStudentAttendanceCounts(attendance.student, attendance.status, -1);

    attendance.status = status;
    await attendance.save();

    // Adjust attendance count for the new status and calculate the updated score
    adjustStudentAttendanceCounts(attendance.student, status, 1);
    calculateStudentScore(attendance.student);
    await attendance.student.save();

    res.status(200).json({ message: "Attendance updated successfully", attendance });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
