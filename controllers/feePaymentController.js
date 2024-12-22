// controllers/FeePaymentController.js
const FeePayment = require("../models/FeePaymentModel");
const User = require("../models/userModel"); // Include the User model
const sendWhatsAppFeePaymentNotification = require('../middlewares/sendWhatsAppFeePaymentNotification');

// Generate a unique transaction ID
const generateUniqueTransactionId = async () => {
  let transactionId;
  let isUnique = false;

  while (!isUnique) {
    // Generate a random 11-digit transaction ID
    transactionId = Math.floor(10000000000 + Math.random() * 90000000000).toString();

    // Check if the transaction ID already exists in the database
    const existingTransaction = await FeePayment.findOne({ transactionId });
    if (!existingTransaction) {
      isUnique = true; // Found a unique ID
    }
  }

  return transactionId;
};

// Create a new transaction
exports.addTransaction = async (req, res) => {
  const { student, amount, method, purpose, memo, paymentGateway } = req.body;

  try {
    // Find the student to check their pending fee
    const user = await User.findById(student).populate({
      path: "batch",
      select: "name standard",
      populate: {
        path: "standard",
        select: "name"
      }
    });
    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if the amount exceeds the pending fee
    if (amount > (user.pendingFee || 0)) {
      return res.status(400).json({ message: "Payment amount exceeds the pending fee" });
    }

    // Generate a unique transaction ID
    const transactionId = await generateUniqueTransactionId();

    // Create a new payment record
    const newFeePayment = new FeePayment({
      student,
      amount,
      method,
      transactionId,
      memo,
      paymentGateway,
      // Add createdBy only if the payment is manual
      ...(paymentGateway === "manual" && { createdBy: req.user._id })
    });

    // Save the new payment
    await newFeePayment.save();

    // Update the student's pending fee after payment
    user.pendingFee = Math.max(0, (user.pendingFee || 0) - amount); // Ensure it doesn't go below 0
    await user.save();
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    sendWhatsAppFeePaymentNotification(
      user.email,
      `Mr/Ms. ${user.parentName}`,    // Parent's Name
      user.name,  // Student's Name
      user.batch.standard.name,     // Student's Class
      user.batch.name,       // Batch Name
      amount,         // Payment Amount
      today,    // Payment Date
      user.pendingFee,         // Pending Fee
      '+91 9834997426 or +91 9156337739', // Support Phone Number
      'Excellence Coaching Classes'  // Institute Name
    )
      .then((res) => console.log('Message sent successfully:', res))
      .catch((err) => console.error('Failed to send message:', err));
    res.status(201).json({ message: "Transaction added successfully", FeePayment: newFeePayment });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a transaction by ID
exports.updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { amount, method, paymentGateway } = req.body;

  try {
    // Find the original transaction to get the current amount
    const originalTransaction = await FeePayment.findById(id);
    if (!originalTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Find the student to check their pending fee
    const user = await User.findById(originalTransaction.student);
    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Calculate the difference between the original amount and the new amount
    const amountDifference = amount - originalTransaction.amount;

    // Check if the new amount adjustment exceeds the student's current pending fee
    if (amount > (originalTransaction.amount + user.pendingFee)) {
      return res.status(400).json({ message: "Updated payment amount exceeds the pending fee" });
    }

    // Update the transaction
    const updatedFeePayment = await FeePayment.findByIdAndUpdate(
      id,
      { amount, method, paymentGateway },
      { new: true }
    );

    if (!updatedFeePayment) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Update the student's pending fee by the amount difference
    user.pendingFee = Math.max(0, (user.pendingFee || 0) - amountDifference);
    await user.save();

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
    // Find the transaction to get the amount and student ID
    const transactionToDelete = await FeePayment.findById(id);
    if (!transactionToDelete) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Delete the transaction
    await FeePayment.findByIdAndDelete(id);

    // Increment the user's pending fee by the amount of the deleted transaction
    const user = await User.findById(transactionToDelete.student);
    if (user) {
      user.pendingFee = (user.pendingFee || 0) + transactionToDelete.amount;
      await user.save();
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get all transactions or transactions for a specific student with pagination
exports.getAllTransactionsById = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { studentId } = req.params;

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

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const FeePayments = await FeePayment.find(query)
      .populate("student", "name email")
      .sort({ date: -1 }) // Sort by date in descending order
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    // Count total transactions for pagination metadata
    const totalTransactions = await FeePayment.countDocuments(query);
    const totalPages = Math.ceil(totalTransactions / limitNumber);

    res.json({
      FeePayments,
      currentPage: pageNumber,
      totalPages,
      totalTransactions,
    });
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    res.status(500).json({ message: "Server error" });
  }
};
