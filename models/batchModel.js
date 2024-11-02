const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Batch A", "Evening Batch"
  
  // Reference to standard, like 10th Grade or 12th Grade
  standard: { type: mongoose.Schema.Types.ObjectId, ref: "Standard" },

  // Added startTime and endTime fields to store time in hh:mm:ss AM/PM format
  startTime: { type: String, required: true }, // Start time of the batch in hh:mm:ss AM/PM format
  endTime: { type: String, required: true },   // End time of the batch in hh:mm:ss AM/PM format

  createdAt: { type: Date, default: Date.now }
});

const Batch = mongoose.model("Batch", batchSchema);
module.exports = Batch;
