// models/userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "teacher", "student"], required: true },
  
  // Only applicable for students and teachers
  batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
  address: { type: String }, // New address field
  profilePic: { type: String }, // New profile picture field
  
  // New fields added
  personalContactNumber: { type: String }, // Personal contact number
  emergencyContactNumber: { type: String }, // Emergency contact number (required)
  dateOfBirth: { type: Date }, // Date of birth
  gender: { type: String, enum: ["male", "female", "other"] }, // Gender field
  parentName: { type: String }, // Parent's name
  parentContactNumber: { type: String }, // Parent's contact number (required)
  relationshipToGuardian: { type: String }, // Relationship to guardian

  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
