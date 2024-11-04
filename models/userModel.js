// models/userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "teacher", "student"], required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
  address: { type: String },
  profilePic: { type: String },

  // Additional personal details
  personalContactNumber: { type: String },
  emergencyContactNumber: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["male", "female", "other"] },
  parentName: { type: String },
  parentContactNumber: { type: String },
  relationshipToGuardian: { type: String },

  // Fees information
  totalFee: { type: Number },
  pendingFee: { type: Number },
  discount: { type: Number },

  // Unique IDs for roles
  studentId: { type: String, unique: true, sparse: true },
  staffId: { type: String, unique: true },

  // Salary information
  salary: { type: Number, required: function() { return this.role !== 'student'; }},
  salaryType: { type: String, enum: ['monthly', 'daily'], required: function() { return this.role !== 'student'; }},

  // Teacher-specific fields
  teacherBatches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch" }],
  subjects: { type: [String], required: function() { return this.role === 'teacher'; } },

  // Enrollment status
  status: { type: String, enum: ["active",'resigned', "absconded", "completed", "re-enrolled", "pending", "postponed", "suspended", "withdrawn"], default: "active" },

  // Attendance tracking
  attendanceCounts: {
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    late: { type: Number, default: 0 },
    "Absent(Informed)": { type: Number, default: 0 }  // Updated field name as requested
  },
  testScroe: { type: Number, default: 0 },

  // Score tracking
  score: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

// Middleware to delete associated attendance and payment records
userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  try {
    await Attendance.deleteMany({ student: this._id });
    await Payment.deleteMany({ student: this._id });
    next();
  } catch (err) {
    console.error("Error in pre-deleteOne middleware:", err);
    next(err);
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
