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
    enum: ["present", "absent", "late","Absent(Informed)"] 
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

// Ensure uniqueness of attendance per student per day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;
