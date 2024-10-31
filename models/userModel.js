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
  
  // New fields added
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
  studentId: { type: String, unique: true }, // Unique student ID
  staffId: { type: String, unique: true }, // Unique teacher ID

  // Salary information for non-students (admin and teacher)
  salary: { 
    type: Number, 
    required: function() { return this.role !== 'student'; } // Required if role is not student
  },
  salaryType: {
    type: String,
    enum: ['monthly', 'daily'],
    required: function() { return this.role !== 'student'; } // Required if role is not student
  },

  // Enrollment status
  status: {
    type: String,
    enum: ["active", "absconded", "completed", "re-enrolled", "pending", "Postponed", "suspended", "withdrawn"],
    default: "active"
  },
  
  createdAt: { type: Date, default: Date.now }
});

// Middleware to delete associated attendance and payment records before deleting a user
userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  try {
    await Attendance.deleteMany({ student: this._id }); // Delete related attendance records
    await Payment.deleteMany({ student: this._id }); // Delete related payment records
    next();
  } catch (err) {
    console.error("Error in pre-deleteOne middleware:", err);
    next(err);
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
