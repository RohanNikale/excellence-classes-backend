// models/standardModel.js
const mongoose = require("mongoose");

const standardSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "10th Grade"

  createdAt: { type: Date, default: Date.now }
});

const Standard = mongoose.model("Standard", standardSchema);
module.exports = Standard;
