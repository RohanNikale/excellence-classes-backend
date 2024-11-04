const StudentMarks = require('../models/StudentMarksModel');
const OnlineMCQTest = require('../models/onlineMCQTestModel'); // Adjust the path as necessary
const User=require('../models/userModel')
const addStudentMarks = async (req, res) => {
    try {
      const { studentId, testId, answers, feedback, createdBy } = req.body;
  
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
        studentId,
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
      const student = await User.findById(studentId);
      if (student) {
        student.score += score; // Update overall score
        student.testScroe += score; // Update total test score
        await student.save();
      }
  
      res.status(201).json({ message: 'Student marks record added successfully', data: savedRecord });
    } catch (error) {
      res.status(500).json({ message: 'Failed to add student marks record', error: error.message });
    }
  };
  
  module.exports = { addStudentMarks };
  
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

// Get all student marks records (with optional filters)
const getAllStudentMarks = async (req, res) => {
  try {
    const filters = req.query; // Optional query parameters for filtering

    const records = await StudentMarks.find({ ...filters, isDeleted: false });

    res.status(200).json({ data: records });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student marks records', error: error.message });
  }
};

module.exports.addStudentMarks = addStudentMarks;
module.exports.getStudentMarksByStudentId = getStudentMarksByStudentId;
module.exports.updateStudentMarks = updateStudentMarks;
module.exports.deleteStudentMarks = deleteStudentMarks;
module.exports.getAllStudentMarks = getAllStudentMarks;
