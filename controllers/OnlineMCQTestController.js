const OnlineMCQTest = require('../models/onlineMCQTestModel'); // Adjust the path as necessary
const StudentMarks=require('../models/StudentMarksModel')
// Create a new online MCQ test
exports.createMCQTest = async (req, res) => {
    try {
        // Add createdBy from the authenticated user ID
        const test = new OnlineMCQTest({
            ...req.body,
            createdBy: req.user._id,
        });
        
        await test.save();
      res.status(201).json({ message: 'MCQ Test created successfully', test });
    } catch (error) {
      res.status(400).json({ message: 'Error creating MCQ Test', error: error.message });
    }
  };
  
// Retrieve all online MCQ tests
exports.getAllTests = async (req, res) => {
  try {
    let tests;

    // Define the fields to populate in the batch
    const batchPopulationFields = { 
      path: 'batch', 
      select: ['name', 'standard'],  // Specify which fields to select from the batch
      populate: { path: 'standard', select: 'name' }  // Populate the standard field if needed
    };

    // Get the date from the query, defaulting to today's date if not provided
    const queryDate = req.query.date ? new Date(req.query.date) : new Date();
    queryDate.setHours(0, 0, 0, 0); // Start of the query date
    const nextDay = new Date(queryDate);
    nextDay.setDate(queryDate.getDate() + 1); // Start of the next day

    if (req.user.role === 'admin') {
      // Admin: Get all tests for the specified date range
      tests = await OnlineMCQTest.find({ 
          testDate: { 
              $gte: queryDate, // Start of the specified date
              $lt: nextDay     // Start of the following date
          }
      })
        .select(['title', 'batch', 'subject', 'testDate'])
        .populate({ path: 'createdBy', select: ['name', 'role'] })
        .populate(batchPopulationFields);

    } else if (req.user.role === 'teacher') {
      // Teacher: Get tests for the teacher's batches within the specified date range
      tests = await OnlineMCQTest.find({ 
          batch: { $in: req.user.teacherBatches },
          testDate: { 
              $gte: queryDate, 
              $lt: nextDay 
          }
      })
        .select(['title', 'batch', 'subject', 'testDate'])
        .populate({ path: 'createdBy', select: ['name', 'role'] })
        .populate(batchPopulationFields);

    } else if (req.user.role === 'student') {
      // Student: Get tests for the student's batch within the specified date range
      tests = await OnlineMCQTest.find({ 
          batch: req.user.batch,
          testDate: { 
              $gte: queryDate, 
              $lt: nextDay 
          }
      })
        .select(['title', 'batch', 'subject', 'testDate'])
        .populate({ path: 'createdBy', select: ['name', 'role'] })
        .populate(batchPopulationFields);

      // Check each test for an attempted status
      const testsWithAttemptedStatus = await Promise.all(tests.map(async (test) => {
        const attempt = await StudentMarks.findOne({ studentId: req.user._id, testId: test._id });
        return {
          ...test.toObject(),
          attempted: !!attempt  // true if attempted, false if not
        };
      }));

      return res.status(200).json(testsWithAttemptedStatus);
    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }

    // Send the filtered tests for admin or teacher
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving tests', error: error.message });
  }
};




// Retrieve a single online MCQ test by ID
exports.getTestById = async (req, res) => {
  try {
    const { testId } = req.params;

    // Check if the student has already taken this test
    const existingRecord = await StudentMarks.findOne({ studentId: req.user.id, testId });
    if (existingRecord) {
      return res.status(200).json({
        message: 'You have already taken this test.',
        studentMarks: existingRecord,
      });
    }

    // Fetch the test details if the student hasn't taken the test
    const test = await OnlineMCQTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'MCQ Test not found' });
    }

    // Check if today's date matches the test date
    const today = new Date().setHours(0, 0, 0, 0); // Set to midnight for accurate comparison
    const testDate = new Date(test.testDate).setHours(0, 0, 0, 0);

    if (today !== testDate) {
      return res.status(400).json({ message: 'The test is not available today. Please check the test date.' });
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
    const { role, _id: userId } = req.user; // Extract role and user ID from the request

    let test;
    if (role === 'admin') {
      // If the user is an admin, delete the test directly
      test = await OnlineMCQTest.findByIdAndDelete(req.params.id);
    } else if (role === 'teacher') {
      // If the user is a teacher, first find the test to check the createdBy field
      test = await OnlineMCQTest.findById(req.params.id);
      if (!test) {
        return res.status(404).json({ message: 'MCQ Test not found' });
      }
      // Check if the teacher is the creator of the test
      if (test.createdBy.toString() === userId.toString()) {
        // If yes, proceed with deletion
        await OnlineMCQTest.findByIdAndDelete(req.params.id);
      } else {
        return res.status(403).json({ message: 'Unauthorized to delete this test' });
      }
    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }

    if (!test) {
      return res.status(404).json({ message: 'MCQ Test not found' });
    }

    res.status(200).json({ message: 'MCQ Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting MCQ Test', error: error.message });
  }
};

