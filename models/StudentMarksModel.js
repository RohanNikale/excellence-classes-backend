const mongoose = require('mongoose');

const StudentMarksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }, // Reference to the Student model
  testId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'OnlineMCQTest', 
    required: function() { return this.testMode === 'online'; } // Only required if test mode is online
  },
  testTitle: { type: String, required: true }, // Title of the test
  testMode: { 
    type: String, 
    enum: ['online', 'offline'], // Only allow 'online' or 'offline'
    required: true 
  },
  testDate: { type: Date, required: true }, // Date when the test was conducted
  score: { type: Number, required: true }, // Total score obtained by the student
  marksObtained: { type: Number, required: true }, // Marks obtained for the test
  totalMarks: { type: Number, required: true }, // Total marks of the test
  attemptedAt: { type: Date, default: Date.now }, // Date when the test was attempted
  feedback: { type: String }, // Feedback for the student
  status: { type: String, enum: ['pass', 'fail'], required: true }, // Pass/Fail status
  subject: { type: String, required: true }, // Subject of the test
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to the User model who created the record
}, { timestamps: true });

const StudentMarks = mongoose.model('StudentMarks', StudentMarksSchema);

module.exports = StudentMarks;

