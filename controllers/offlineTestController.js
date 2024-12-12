const OfflineTest = require('../models/OfflineTestModel');  // Adjust path as needed

// Create a new offline test
exports.createTest = async (req, res) => {
  try {
    // Set createdBy to the logged-in user's ID
    const newTest = new OfflineTest({
      ...req.body,
      createdBy: req.user._id  // Automatically set createdBy from the logged-in user's ID
    });
    const savedTest = await newTest.save();
    res.status(201).json(savedTest);
  } catch (error) {
    res.status(400).json({ message: 'Error creating test', error });
  }
};

// Get all offline tests






exports.getAllOfflineTests = async (req, res) => {
  try {
      let tests;

      // Get the date from the query, defaulting to today's date if not provided
      const queryDate = req.query.date ? new Date(req.query.date) : new Date();
      queryDate.setHours(0, 0, 0, 0); // Start of the query date

      // Pagination parameters
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const limit = parseInt(req.query.limit) || 20; // Default to 10 items per page
      const skip = (page - 1) * limit;

      // Define the fields to populate in the batch
      const batchPopulationFields = {
          path: 'batch',
          select: ['name', 'standard'], // Specify which fields to select from the batch
          populate: { path: 'standard', select: 'name' } // Populate the standard field if needed
      };

      // Admin: Get all offline tests from today's date onward
      if (req.user.role === 'admin') {
          tests = await OfflineTest.find({
              testDate: {
                  $gte: queryDate
              }
          })
          .populate(batchPopulationFields)
          .skip(skip)
          .limit(limit);

      // Teacher: Get offline tests for the teacher's batches from today's date onward
      } else if (req.user.role === 'teacher') {
          tests = await OfflineTest.find({
              batch: { $in: req.user.teacherBatches },
              testDate: {
                  $gte: queryDate
              }
          })
          .populate(batchPopulationFields)
          .skip(skip)
          .limit(limit);

      // Student: Get offline tests for the student's batch from today's date onward
      } else if (req.user.role === 'student') {
          tests = await OfflineTest.find({
              batch: req.user.batch,
              testDate: {
                  $gte: queryDate
              }
          })
          .populate(batchPopulationFields)
          .skip(skip)
          .limit(limit);

      } else {
          return res.status(403).json({ message: 'Unauthorized role' });
      }

      // Count total documents for pagination metadata
      const totalDocuments = await OfflineTest.countDocuments({
          testDate: {
              $gte: queryDate
          }
      });

      // Send the filtered tests with pagination metadata
      res.status(200).json({
          totalDocuments,
          currentPage: page,
          totalPages: Math.ceil(totalDocuments / limit),
          tests
      });
  } catch (error) {
      res.status(500).json({ message: 'Error fetching tests', error: error.message });
  }
};

  

// Get a specific test by ID
exports.getTestById = async (req, res) => {
  try {
    const test = await OfflineTest.findById(req.params.testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.status(200).json(test);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching test', error });
  }
};

// Update a test by ID
exports.updateTest = async (req, res) => {
  try {
    const updatedTest = await OfflineTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTest) return res.status(404).json({ message: 'Test not found' });
    res.status(200).json(updatedTest);
  } catch (error) {
    res.status(400).json({ message: 'Error updating test', error });
  }
};

// Delete a test by ID
exports.deleteTest = async (req, res) => {
  try {
    const deletedTest = await OfflineTest.findByIdAndDelete(req.params.id);
    if (!deletedTest) return res.status(404).json({ message: 'Test not found' });
    res.status(200).json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting test', error });
  }
};
