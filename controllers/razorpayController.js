// controllers/razorpayController.js
const Razorpay = require("razorpay");
const crypto = require("crypto");
const FeePayment = require("../models/FeePaymentModel");
const User = require("../models/userModel"); // Include the User model

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
exports.createOrder = async (req, res) => {
  try {
      const { amount, currency, method, memo } = req.body;
      const pendingFee = req.user.pendingFee;


      if (amount > pendingFee) {
          return res.status(400).json({
              success: false,
              message: `The requested amount exceeds the pending fee. Your pending fee is ₹${pendingFee}.`,
          });
      }

      const options = {
          amount: amount * 100, // Ensure amount is in paise
          currency: currency || "INR",
          receipt: `rcpt_${Date.now()}`,
          payment_capture: 1,
      };


      const order = await razorpay.orders.create(options);

      if (!order) {
          console.error("Failed to create Razorpay order.");
          return res.status(500).json({ success: false, message: "Failed to create Razorpay order." });
      }

      const paymentData = {
          student: req.user._id,
          amount,
          date: new Date(),
          method,
          transactionId: order.id,
          status: "pending",
          currency: options.currency,
          memo,
          paymentGateway: "razorpay",
      };

      const feePayment = await FeePayment.create(paymentData);

      res.json({ success: true, order, feePayment });
  } catch (error) {
      console.error("Error in createOrder:", error.message);
      res.status(500).json({ success: false, error: error.message });
  }
};


// Verify Razorpay Payment
exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
  
    try {
      // Find the FeePayment record by transaction ID (order ID)
      const feePayment = await FeePayment.findOne({ transactionId: razorpay_order_id });
  
      if (!feePayment) {
        return res.status(404).json({ success: false, message: "Fee payment record not found" });
      }
  
      if (expectedSignature === razorpay_signature) {
        // Payment verified successfully
        feePayment.status = "completed";
        feePayment.transactionId = razorpay_payment_id;
        feePayment.updatedAt = new Date();
        await feePayment.save();
  
        // Update the student's pending fee
        const user = await User.findById(feePayment.student);
        if (!user) {
          return res.status(404).json({ success: false, message: "Student not found" });
        }
  
        // Subtract the payment amount from the student's pending fee
        user.pendingFee = Math.max(0, (user.pendingFee || 0) - feePayment.amount);
        await user.save();
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;
        sendWhatsAppFeePaymentNotification(
          `+91${user.parentContactNumber}`,
          `Mr/Ms. ${user.parentName}`,    // Parent's Name
          user.name,  // Student's Name
          user.batch.standard.name,     // Student's Class
          user.batch.name,       // Batch Name
          amount,         // Payment Amount
          today,    // Payment Date
          user.pendingFee,         // Pending Fee
          '+919021402272', // Support Phone Number
          'Excellence Coaching Classes'  // Institute Name
        )
          .then((res) => console.log('Message sent successfully:', res))
          .catch((err) => console.error('Failed to send message:', err));
        res.json({ success: true, message: "Payment verified successfully", feePayment });
      } else {
        // Payment verification failed
        feePayment.status = "failed";
        feePayment.updatedAt = new Date();
        await feePayment.save();
  
        res.status(400).json({ success: false, message: "Payment verification failed" });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ success: false, message: "Server error during payment verification" });
    }
  };
  