const mongoose = require("mongoose");

const standardSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "10th Grade", "12th Grade"
  subjects: [{ type: String }], // Array of subjects for this standard
  fee: { type: Number, required: true }, // Fee associated with this standard

  createdAt: { type: Date, default: Date.now }
});

const Standard = mongoose.model("Standard", standardSchema);
module.exports = Standard;
