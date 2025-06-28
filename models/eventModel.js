const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  date: {
    type: Date,
    required: true,
  },
  eventType: {
    type: String,
    enum: ["exam", "holiday", "workshop", "general"],
    default: "general",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Event", eventSchema);
