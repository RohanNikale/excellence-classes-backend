const Standard = require("../models/standardModel");

// Create a new standard
exports.createStandard = async (req, res) => {
  try {
    const standard = new Standard(req.body);
    await standard.save();
    res.status(201).json(standard);
  } catch (error) {
    res.status(500).json({ error: "Error creating standard" });
  }
};

// Get all standards
exports.getAllStandards = async (req, res) => {
  try {
    const standards = await Standard.find();
    res.status(200).json(standards);
  } catch (error) {
    res.status(500).json({ error: "Error fetching standards" });
  }
};

// Update a standard
exports.updateStandard = async (req, res) => {
  try {
    const standard = await Standard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(standard);
  } catch (error) {
    res.status(500).json({ error: "Error updating standard" });
  }
};

// Delete a standard
exports.deleteStandard = async (req, res) => {
  try {
    await Standard.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Standard deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting standard" });
  }
};
