// controllers/staffAttendanceController.js
const StaffAttendance = require("../models/staffAttendanceModel");
const User = require("../models/userModel");

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
      attendance.status = status;
      attendance.markedBy = req.user.id;
      await attendance.save();
      return res.status(200).json({ message: "Attendance updated successfully", attendance });
    } else {
      attendance = new StaffAttendance({
        staff: staffId,
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
        attendance.status = status;
        attendance.markedBy = req.user.id;
        await attendance.save();
        return { staffId, message: "Attendance updated" };
      } else {
        attendance = new StaffAttendance({
          staff: staffId,
          status,
          markedBy: req.user.id,
          date: attendanceDate
        });
        await attendance.save();
        return { staffId, message: "Attendance marked" };
      }
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

  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(targetDate.getDate() + 1);

  try {
    const attendanceRecords = await StaffAttendance.find({
      date: { $gte: targetDate, $lt: nextDay },
    }).populate("staff", "name");

    // Filter records to include only active or re-enrolled staff members
    const response = attendanceRecords
      .filter(record => record.staff.status && ["active", "re-enrolled"].includes(record.staff.status))
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
exports.getStaffAttendanceById = async (req, res) => {
  const { staffId } = req.params;

  try {
    const attendanceRecords = await StaffAttendance.find({ staff: staffId })
      .populate("staff", "name status") // Include status field in population
      .sort({ date: -1 });

    // Filter to include only active or re-enrolled staff members
    const filteredRecords = attendanceRecords.filter(record => record.staff.status && ["active", "re-enrolled"].includes(record.staff.status));

    res.status(200).json(filteredRecords);
  } catch (err) {
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

    attendance.status = status;
    await attendance.save();

    res.status(200).json({ message: "Attendance updated successfully", attendance });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
