// controllers/FeePaymentController.js
const FeePayment = require("../models/FeePaymentModel");

// Create a new transaction
exports.addTransaction = async (req, res) => {
  const { student, amount, method } = req.body;

  try {
    const newFeePayment = new FeePayment({ student, amount, method });
    await newFeePayment.save();
    res.status(201).json({ message: "Transaction added successfully", FeePayment: newFeePayment });
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
    const updatedFeePayment = await FeePayment.findByIdAndUpdate(
      id,
      { amount, method },
      { new: true }
    );

    if (!updatedFeePayment) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction updated successfully", FeePayment: updatedFeePayment });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a transaction by ID
exports.deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFeePayment = await FeePayment.findByIdAndDelete(id);

    if (!deletedFeePayment) {
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
    let query = {};

    if (req.user.role === "admin") {
      // Admin can view all transactions or filter by specific student if provided in query
      query = studentId ? { student: studentId } : {};
    } else if (req.user.role === "student") {
      // Students can only view their own transactions
      query = { student: req.user._id };
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    const FeePayments = await FeePayment.find(query).populate("student", "name email");

    res.json({ FeePayments });
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    res.status(500).json({ message: "Server error" });
  }
};
