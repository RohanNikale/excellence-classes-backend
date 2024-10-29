// routes/paymentRoutes.js
const express = require("express");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

router.post("/add", paymentController.addTransaction);
router.put("/update/:id", paymentController.updateTransaction);
router.delete("/delete/:id", paymentController.deleteTransaction);
router.get("/all", paymentController.getAllTransactions);

module.exports = router;
