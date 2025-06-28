const Event = require("../models/eventModel");

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error });
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, eventType } = req.body;
    const newEvent = new Event({
      title,
      description,
      date,
      eventType,
      createdBy: req.user?._id || null, // optional if using auth
    });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: "Error creating event", error });
  }
};
