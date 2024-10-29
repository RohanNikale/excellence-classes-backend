// models/attendanceModel.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ["present", "absent", "late"] 
  },
  date: { 
    type: Date, 
    required: true,
    default: function() {
      // Default to today's date at midnight if no date is provided
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
  },
  markedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }
});

// Ensure uniqueness of attendance per student per day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;
