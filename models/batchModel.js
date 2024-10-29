// models/batchModel.js
const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Batch A", "Evening Batch"
  
  // Reference to standard, like 10th Grade or 12th Grade
  standard: { type: mongoose.Schema.Types.ObjectId, ref: "Standard" },

  // Arrays to link students and teachers with this batch
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  createdAt: { type: Date, default: Date.now }
});

const Batch = mongoose.model("Batch", batchSchema);
module.exports = Batch;
