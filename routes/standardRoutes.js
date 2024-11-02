const express = require("express");
const router = express.Router();
const standardController = require("../controllers/standardController");
const { auth } = require("../middlewares/authMiddleware");

// Apply the `auth` middleware to restrict access based on roles
router.post("/", auth(["admin"]), standardController.createStandard);          // Only admins can create standards
router.get("/", auth(["admin"]), standardController.getAllStandards); // Admins and teachers can view standards
router.put("/:id", auth(["admin"]), standardController.updateStandard);        // Only admins can update standards
router.delete("/:id", auth(["admin"]), standardController.deleteStandard);     // Only admins can delete standards

module.exports = router;
