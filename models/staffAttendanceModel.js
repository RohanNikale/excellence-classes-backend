const mongoose = require("mongoose");

const staffAttendanceSchema = new mongoose.Schema({
  staff: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ["present", "absent", "late", "Absent(Informed)"] 
  },
  date: { 
    type: Date, 
    required: true,
  },
  markedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }
});

// Ensure uniqueness of attendance per staff per day
staffAttendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

const StaffAttendance = mongoose.model("StaffAttendance", staffAttendanceSchema);
module.exports = StaffAttendance;
