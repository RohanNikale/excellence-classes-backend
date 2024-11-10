// routes/paymentRoutes.js
const express = require("express");
const razorpayController = require("../controllers/razorpayController");
const { auth } = require("../middlewares/authMiddleware");

const router = express.Router();

// Razorpay Integration Routes
router.post("/razorpay/create-order", auth(["admin", "student"]), razorpayController.createOrder); // Create Razorpay order
router.post("/razorpay/verify-payment", auth(["admin", "student"]), razorpayController.verifyPayment); // Verify Razorpay payment

module.exports = router;
