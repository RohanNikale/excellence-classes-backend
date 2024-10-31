// routes/paymentRoutes.js
const express = require("express");
const paymentController = require("../controllers/paymentController");
const { auth } = require("../middlewares/authMiddleware");

const router = express.Router();

// Payment Management Routes - Admin Only
router.post("/add", auth(["admin"]), paymentController.addTransaction);        // Add a transaction
router.put("/update/:id", auth(["admin"]), paymentController.updateTransaction); // Update a transaction by ID
router.delete("/delete/:id", auth(["admin"]), paymentController.deleteTransaction); // Delete a transaction by ID
router.get("/all", auth(["admin", "student"]), paymentController.getAllTransactions); // Get all transactions (students can view their own)

module.exports = router;
