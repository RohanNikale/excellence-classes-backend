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
  const { role, teacherBatches } = req.user; // Get role and teacher's batches from req.user

  try {
    let query = {};

    // If the user is a teacher, restrict the batches to those in teacherBatches
    if (role === "teacher") {
      query = { _id: { $in: teacherBatches } };
    }

    // Fetch the batches with optional filtering for teachers
    const batches = await Batch.find(query).populate("standard", "name subjects");

    res.status(200).json(batches);
  } catch (error) {
    console.error("Error fetching batches:", error);
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
