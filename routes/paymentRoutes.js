// routes/paymentRoutes.js
const express = require("express");
const feePaymentController = require("../controllers/feePaymentController");
const { auth } = require("../middlewares/authMiddleware");

const router = express.Router();

// Payment Management Routes - Admin Only
router.post("/fee/add", auth(["admin"]), feePaymentController.addTransaction);        // Add a transaction
router.put("/fee/update/:id", auth(["admin"]), feePaymentController.updateTransaction); // Update a transaction by ID
router.delete("/fee/delete/:id", auth(["admin"]), feePaymentController.deleteTransaction); // Delete a transaction by ID
router.get("/fee/all/:studentId", auth(["admin", "student"]), feePaymentController.getAllTransactionsById); // Get all transactions (students can view their own)

module.exports = router;
