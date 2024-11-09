const StudentMarks = require('../models/StudentMarksModel');
const OnlineMCQTest = require('../models/onlineMCQTestModel'); // Adjust the path as necessary
const OfflineTest=require('../models/OfflineTestModel');
const User = require('../models/userModel')
// Bulk add student marks
const bulkAddStudentMarks = async (req, res) => {

  const { records } = req.body; // Expecting an array of student records from the frontend
  const { testId } = req.params; // Get testId from URL parameters

  // Validate input records
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: 'No records provided for bulk add' });
  }

  try {
    const savedRecords = [];

    // Fetch the test details using testId
    const test = await OfflineTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const { title, testDate, subject, totalMarks } = test;

    for (const record of records) {
      let { studentId, marksObtained, feedback } = record;

      // Convert marksObtained to number, if possible
      marksObtained = Number(marksObtained);
      if (isNaN(marksObtained)) {
        savedRecords.push({
          studentId,
          testId,
          message: `Marks obtained (${record.marksObtained}) is not a valid number.`,
        });
        continue; // Skip this record if marks are invalid
      }

      // Validate marksObtained
      if (marksObtained > totalMarks) {
        savedRecords.push({
          studentId,
          testId,
          message: `Marks obtained (${marksObtained}) cannot be greater than total marks (${totalMarks}).`,
        });
        continue;
      }

      // Check if the student has already taken this test
      const existingRecord = await StudentMarks.findOne({ studentId, testId });
      if (existingRecord) {
        savedRecords.push({ studentId, testId, message: 'Test already taken' });
        continue;
      }

      // Define pass/fail status based on marks obtained
      const status = marksObtained >= totalMarks / 2 ? 'pass' : 'fail';

      // Create the new student record
      const newRecord = new StudentMarks({
        studentId,
        testId,
        testTitle: title,
        testMode: 'offline', // Assuming it's an offline test
        testDate,
        marksObtained,
        score: marksObtained,
        totalMarks,
        feedback,
        subject,
        status,
        createdBy: req.user._id, // The user making the request (instructor/admin)
      });

      // Save the student's test record
      const savedRecord = await newRecord.save();

      // Update the student's profile with the obtained marks
      const student = await User.findById(studentId);
      if (student) {
        student.testScore = student.testScore + marksObtained; // Update total test score
        await student.save();
      }

      savedRecords.push({ studentId, testId, message: 'Record added successfully', data: savedRecord });
    }

    // Update the resultDeclared field to true after all records are processed
    await OfflineTest.findByIdAndUpdate(testId, { resultDeclared: true });

    res.status(201).json({
      message: 'Bulk add of student marks completed and result declared',
      results: savedRecords,
    });
  } catch (error) {
    console.error('Error in bulkAddStudentMarks:', error);
    res.status(500).json({ message: 'Failed to perform bulk add', error: error.message });
  }
};


































const addStudentMarks = async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(404).json({ message: 'Only student can give this test' });
  }
  try {
    const { testId, answers, feedback, createdBy } = req.body;

    // Check if the student has already taken this test
    const existingRecord = await StudentMarks.findOne({ studentId: req.user._id, testId });
    if (existingRecord) {
      return res.status(400).json({ message: 'Test has already been taken by the student' });
    }

    // Fetch the test details using testId
    const test = await OnlineMCQTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Calculate the score based on the provided answers
    let score = 0;
    let totalMarks = 0;
    test.questions.forEach((question, index) => {
      if (answers[index]?.selectedAnswer === question.correctAnswer) {
        score += question.marks;
      }
      totalMarks += question.marks;
    });

    // Define pass/fail status based on score
    const status = score >= totalMarks / 2 ? 'pass' : 'fail';

    // Create the new record with data from the test
    const newRecord = new StudentMarks({
      studentId: req.user._id,
      testId,
      testTitle: test.title,
      testMode: 'online', // or another default if you have one
      testDate: test.testDate,
      score,
      marksObtained: score,
      totalMarks,
      feedback,
      subject: test.subject,
      status,
      createdBy,
    });

    // Save the student's test record
    const savedRecord = await newRecord.save();

    // Update the student's profile with the obtained marks
    const student = await User.findById(req.user._id);
    if (student) {
      student.testScore += score; // Update total test score
      await student.save();
    }

    res.status(201).json({ message: 'Student marks record added successfully', data: savedRecord });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add student marks record', error: error.message });
  }
};


// Get all records for a specific student
const getStudentMarksByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const records = await StudentMarks.find({ studentId, isDeleted: false });

    if (!records.length) {
      return res.status(404).json({ message: 'No records found for this student' });
    }

    res.status(200).json({ data: records });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student marks records', error: error.message });
  }
};

// Update a student marks record
const updateStudentMarks = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedRecord = await StudentMarks.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedRecord) {
      return res.status(404).json({ message: 'Student marks record not found' });
    }

    res.status(200).json({ message: 'Student marks record updated successfully', data: updatedRecord });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student marks record', error: error.message });
  }
};

// Soft delete a student marks record
const deleteStudentMarks = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecord = await StudentMarks.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    if (!deletedRecord) {
      return res.status(404).json({ message: 'Student marks record not found' });
    }

    res.status(200).json({ message: 'Student marks record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student marks record', error: error.message });
  }
};

// Get all student marks records (with optional filters, sorting, and pagination)
const getStudentMarksByTestId = async (req, res) => {
  try {
    const { testId } = req.params; // Get test ID from request parameters
    const { page = 1, limit = 20 } = req.query; // Get pagination parameters (default: page 1, limit 10)

    // Calculate the skip value
    const skip = (page - 1) * limit;

    // Fetch and sort student marks records by `marksObtained` in descending order with pagination
    const records = await StudentMarks.find({ testId, isDeleted: false })
      .populate({ path: 'studentId', select: ['name'] })
      .sort({ marksObtained: -1 }) // Sort by marksObtained (descending order)
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count of records (for pagination)
    const totalRecords = await StudentMarks.countDocuments({ testId, isDeleted: false });
    const totalPages = Math.ceil(totalRecords / limit);

    // Check if records exist
    if (!records || records.length === 0) {
      return res.status(404).json({ message: 'No marks found for this test ID' });
    }

    // Respond with sorted and paginated data
    res.status(200).json({
      data: records,
      currentPage: parseInt(page),
      totalPages,
      totalRecords,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student marks records', error: error.message });
  }
};


module.exports.addStudentMarks = addStudentMarks;
module.exports.getStudentMarksByStudentId = getStudentMarksByStudentId;
module.exports.updateStudentMarks = updateStudentMarks;
module.exports.deleteStudentMarks = deleteStudentMarks;
module.exports.getStudentMarksByTestId = getStudentMarksByTestId;
module.exports.bulkAddStudentMarks = bulkAddStudentMarks;
