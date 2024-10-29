const Batch = require("../models/batchModel");

// Create a new batch
exports.createBatch = async (req, res) => {
  try {
    const batch = new Batch(req.body);
    await batch.save();
    res.status(201).json(batch);
  } catch (error) {
    res.status(500).json({ error: "Error creating batch" });
  }
};

// Get all batches
exports.getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find().populate("standard students teachers", "name");
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ error: "Error fetching batches" });
  }
};

// Update a batch
exports.updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json({ error: "Error updating batch" });
  }
};

// Delete a batch
exports.deleteBatch = async (req, res) => {
  try {
    await Batch.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Batch deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting batch" });
  }
};
