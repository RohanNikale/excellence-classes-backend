// controllers/paymentController.js
const Payment = require("../models/FeePaymentModel");

// Create a new transaction
exports.addTransaction = async (req, res) => {
  const { student, amount, method } = req.body;

  try {
    const newPayment = new Payment({ student, amount, method });
    await newPayment.save();
    res.status(201).json({ message: "Transaction added successfully", payment: newPayment });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a transaction by ID
exports.updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { amount, method } = req.body;

  try {
    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      { amount, method },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction updated successfully", payment: updatedPayment });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a transaction by ID
exports.deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPayment = await Payment.findByIdAndDelete(id);

    if (!deletedPayment) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all transactions or transactions for a specific student
exports.getAllTransactions = async (req, res) => {
  const { studentId } = req.query;

  try {
    const query = studentId ? { student: studentId } : {};
    const payments = await Payment.find(query).populate("student", "name email");

    res.json({ payments });
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    res.status(500).json({ message: "Server error" });
  }
};
