const OnlineMCQTest = require('../models/onlineMCQTestModel'); // Adjust the path as necessary

// Create a new online MCQ test
exports.createMCQTest = async (req, res) => {
    console.log(req.body);
    try {
        // Add createdBy from the authenticated user ID
        const test = new OnlineMCQTest({
            ...req.body,
            createdBy: req.user._id,
        });
        
        await test.save();
        console.log('Creating')
      res.status(201).json({ message: 'MCQ Test created successfully', test });
    } catch (error) {
      res.status(400).json({ message: 'Error creating MCQ Test', error: error.message });
    }
  };
  
// Retrieve all online MCQ tests
exports.getAllTests = async (req, res) => {
  try {
    const tests = await OnlineMCQTest.find();
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving tests', error: error.message });
  }
};

// Retrieve a single online MCQ test by ID
exports.getTestById = async (req, res) => {
  try {
    const test = await OnlineMCQTest.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'MCQ Test not found' });
    }
    res.status(200).json(test);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving MCQ Test', error: error.message });
  }
};

// Update an online MCQ test by ID
exports.updateTest = async (req, res) => {
  try {
    const test = await OnlineMCQTest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!test) {
      return res.status(404).json({ message: 'MCQ Test not found' });
    }
    res.status(200).json({ message: 'MCQ Test updated successfully', test });
  } catch (error) {
    res.status(400).json({ message: 'Error updating MCQ Test', error: error.message });
  }
};

// Delete an online MCQ test by ID
exports.deleteTest = async (req, res) => {
  try {
    const test = await OnlineMCQTest.findByIdAndDelete(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'MCQ Test not found' });
    }
    res.status(200).json({ message: 'MCQ Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting MCQ Test', error: error.message });
  }
};
