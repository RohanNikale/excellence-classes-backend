const express = require("express");
const router = express.Router();
const batchController = require("../controllers/batchController");
const { auth } = require("../middlewares/authMiddleware");

// Apply the `auth` middleware to ensure only authorized users can access these routes
router.post("/", auth(["admin"]), batchController.createBatch);         // Only admins can create batches
router.get("/", auth(["admin", "teacher"]), batchController.getAllBatches); // Admins and teachers can view batches
router.put("/:id", auth(["admin"]), batchController.updateBatch);       // Only admins can update batches
router.delete("/:id", auth(["admin"]), batchController.deleteBatch);    // Only admins can delete batches

module.exports = router;
