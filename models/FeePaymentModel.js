// models/paymentModel.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: {
    type: String,
    enum: ["cash", "card", "bank_transfer", "UPI"],
    required: true
  },
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
