const mongoose = require('mongoose');
const salarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Confirm this matches
  salary: { type: Number, required: true },
  presentDays: { type: Number, required: true },
  absentDays: { type: Number, required: true },
  totalDaysInMonth: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  advance: { type: Number, default: 0 }, // Advance payment field
  bonus: { type: Number, default: 0 }, // Bonus field
  paymentMethod: { 
    type: String, 
    enum: ["cash", "cheque", "bank_transfer", "pending"], 
    default: "pending" 
  },
  status: { 
    type: String, 
    enum: ["paid", "unpaid", "pending"], 
    default: "unpaid" 
  },
});

// Ensure unique index on user, month, year
salarySchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Salary", salarySchema);
