// models/FeePaymentModel.js
const mongoose = require("mongoose");

const FeePaymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: {
    type: String,
    enum: ["cash", "card", "bank_transfer", "UPI"],
    required: true
  },
  transactionId: { type: String, required: true, unique: true }, // Ensure transactionId is unique
  status: {
    type: String,
    enum: ["completed", "pending", "failed"],
    default: "completed"
  },
  currency: { type: String, default: "INR" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Added for manual payments
  updatedAt: { type: Date, default: Date.now },
  memo: { type: String }, // Added memo field for additional notes
  paymentGateway: { type: String, enum: ["manual", "paymentGateway"], required: true } // Changed to paymentGateway
});

const FeePayment = mongoose.model("Payment", FeePaymentSchema);
module.exports = FeePayment;
