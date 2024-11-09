// controllers/staffAttendanceController.js
const StaffAttendance = require("../models/staffAttendanceModel");
const User = require("../models/userModel");

// Helper function to adjust staff's attendance count based on status change
function adjustStaffAttendanceCounts(staff, status, increment) {
  switch (status) {
    case "present":
      staff.attendanceCounts.present += increment;
      break;
    case "late":
      staff.attendanceCounts.late += increment;
      break;
    case "absent":
      staff.attendanceCounts.absent += increment;
      break;
    case "Absent(Informed)":
      staff.attendanceCounts["Absent(Informed)"] += increment;
      break;
    default:
      break;
  }
}

// Helper function to calculate the score based on attendance counts
function calculateStaffScore(staff) {
  const presentScore = staff.attendanceCounts.present * 1;
  const lateScore = staff.attendanceCounts.late * 0.5;
  const absentScore = staff.attendanceCounts.absent * 0;
  const informedAbsentScore = staff.attendanceCounts["Absent(Informed)"] * 0.75;

  staff.attendanceScore = presentScore + lateScore + absentScore + informedAbsentScore;
}

// Mark Attendance for a single staff member
exports.markStaffAttendance = async (req, res) => {
  const { staffId, status, date } = req.body;

  try {
    const staff = await User.findById(staffId);
    if (!staff || staff.role === "student" || !["active", "re-enrolled"].includes(staff.status)) {
      return res.status(404).json({ message: "Staff member not found or inactive" });
    }

    const attendanceDate = date ? new Date(new Date(date).setHours(0, 0, 0, 0)) : new Date(new Date().setHours(0, 0, 0, 0));

    let attendance = await StaffAttendance.findOne({ staff: staffId, date: attendanceDate });

    if (attendance) {
      // Adjust attendance count for the previous status
      adjustStaffAttendanceCounts(staff, attendance.status, -1);

      // Update attendance with the new status
      attendance.status = status;
      attendance.markedBy = req.user.id;
      await attendance.save();
    } else {
      // New attendance record
      attendance = new StaffAttendance({
        staff: staffId,
        status,
        markedBy: req.user.id,
        date: attendanceDate
      });
      await attendance.save();
    }

    // Adjust attendance count for the new status and calculate the updated score
    adjustStaffAttendanceCounts(staff, status, 1);
    calculateStaffScore(staff);
    await staff.save();

    return res.status(attendance ? 200 : 201).json({
      message: attendance ? "Attendance updated successfully" : "Attendance marked successfully",
      attendance
    });
  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark Bulk Attendance for multiple staff members
exports.markBulkStaffAttendance = async (req, res) => {
  const { attendances } = req.body;

  if (!Array.isArray(attendances) || attendances.length === 0) {
    return res.status(400).json({ message: "Invalid input: 'attendances' must be a non-empty array." });
  }

  try {
    const bulkOperations = attendances.map(async ({ staffId, status, date }) => {
      const staff = await User.findById(staffId);
      if (!staff || staff.role === "student" || !["active", "re-enrolled"].includes(staff.status)) {
        return { staffId, error: "Staff member not found or inactive" };
      }

      const attendanceDate = date ? new Date(new Date(date).setHours(0, 0, 0, 0)) : new Date(new Date().setHours(0, 0, 0, 0));
      let attendance = await StaffAttendance.findOne({ staff: staffId, date: attendanceDate });

      if (attendance) {
        // Adjust attendance count for the previous status
        adjustStaffAttendanceCounts(staff, attendance.status, -1);

        // Update attendance with the new status
        attendance.status = status;
        attendance.markedBy = req.user.id;
        await attendance.save();
      } else {
        // New attendance record
        attendance = new StaffAttendance({
          staff: staffId,
          status,
          markedBy: req.user.id,
          date: attendanceDate
        });
        await attendance.save();
      }

      // Adjust attendance count for the new status and calculate the updated score
      adjustStaffAttendanceCounts(staff, status, 1);
      calculateStaffScore(staff);
      await staff.save();

      return { staffId, message: attendance ? "Attendance updated" : "Attendance marked" };
    });

    const results = await Promise.all(bulkOperations);
    res.status(200).json({ message: "Bulk attendance processed", results });
  } catch (err) {
    console.error("Error in bulk attendance marking:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Staff Attendance Sorted by Date
exports.getAllStaffAttendanceSortedByDate = async (req, res) => {
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
    const attendanceRecords = await StaffAttendance.find({
      date: { $gte: targetDate, $lt: nextDay },
    }).populate("staff", "name status");

    // Filter records to include only active or re-enrolled staff members
    const response = attendanceRecords
      .filter(record => record.staff && ["active", "re-enrolled"].includes(record.staff.status))
      .map(record => ({
        staffName: record.staff.name,
        status: record.status,
        date: record.date,
      }));

    res.status(200).json(response);
  } catch (err) {
    console.error("Error retrieving staff attendance by date:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Staff Attendance Records
exports.getAllStaffAttendance = async (req, res) => {
  try {
    const attendanceRecords = await StaffAttendance.find()
      .populate("staff", "name status") // Include status field in population
      .sort({ date: -1 });

    // Filter records to include only active or re-enrolled staff members
    const response = attendanceRecords
      .filter(record => record.staff.status && ["active", "re-enrolled"].includes(record.staff.status));

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Attendance by Staff ID
// Assuming a pagination mechanism with page and limit query parameters
exports.getStaffAttendanceById = async (req, res) => {
  const { staffId } = req.params;
  const page = parseInt(req.query.page) || 1; // Get the page number from query params
  const limit = 10; // Define the limit for records per page
  const skip = (page - 1) * limit; // Calculate the number of records to skip for pagination

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
    // Fetch attendance records with pagination and date filter
    const attendanceRecords = await StaffAttendance.find({
        staff: staffId,
        ...(Object.keys(dateFilter).length && { date: dateFilter }) // Apply date filter if present
      })
      .populate("staff", "name status") // Include status field in population
      .populate("markedBy", "name role") // Populate markedBy field with name and role
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    // Filter to include only active or re-enrolled staff members
    const filteredRecords = attendanceRecords.filter(record => 
      record.staff.status && ["active", "re-enrolled"].includes(record.staff.status)
    );

    // Get total count for pagination purposes, applying date filter if provided
    const totalCount = await StaffAttendance.countDocuments({ 
      staff: staffId,
      ...(Object.keys(dateFilter).length && { date: dateFilter })
    });
    
    const totalPages = Math.ceil(totalCount / limit);

    // Send the filtered records along with pagination info
    res.status(200).json({
      records: filteredRecords,
      totalPages, // Total number of pages available
      currentPage: page, // Current page
    });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};


// Update Attendance - Only for admin and certain users
exports.updateStaffAttendance = async (req, res) => {
  const { attendanceId, status } = req.body;

  try {
    const attendance = await StaffAttendance.findById(attendanceId).populate("staff", "status");
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (!["active", "re-enrolled"].includes(attendance.staff.status)) {
      return res.status(403).json({ message: "Cannot update attendance for inactive staff" });
    }

    // Adjust attendance count for the previous status
    adjustStaffAttendanceCounts(attendance.staff, attendance.status, -1);

    attendance.status = status;
    await attendance.save();

    // Adjust attendance count for the new status and calculate the updated score
    adjustStaffAttendanceCounts(attendance.staff, status, 1);
    calculateStaffScore(attendance.staff);
    await attendance.staff.save();

    res.status(200).json({ message: "Attendance updated successfully", attendance });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
