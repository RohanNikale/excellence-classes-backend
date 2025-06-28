const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

// Public routes
router.get("/", eventController.getEvents);

// Optional: Use middleware to protect this route (like admin only)
router.post("/", eventController.createEvent);

module.exports = router;
