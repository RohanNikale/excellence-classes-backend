const mongoose = require('mongoose');

const StudentMarksSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  }, // Reference to the Student model
  testId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'OnlineMCQTest', 
    required: true // Only required if test mode is online
  },
  testTitle: { 
    type: String, 
    required: true 
  }, // Title of the test
  testMode: { 
    type: String, 
    enum: ['online', 'offline'], 
    required: true 
  }, // Specifies if the test was online or offline
  testDate: { 
    type: Date, 
    required: true 
  }, // Date when the test was conducted
  score: { 
    type: Number, 
    required: true 
  }, // Calculated score obtained by the student
  marksObtained: { 
    type: Number, 
    required: true 
  }, // Marks actually obtained for the test
  totalMarks: { 
    type: Number, 
    required: true 
  }, // Total possible marks of the test
  attemptedAt: { 
    type: Date, 
    default: Date.now 
  }, // Date when the test was attempted
  feedback: { 
    type: String 
  }, // Optional feedback for the student
  status: { 
    type: String, 
    enum: ['pass', 'fail'], 
    required: true 
  }, // Pass/Fail status based on score
  subject: { 
    type: String, 
    required: true 
  }, // Subject of the test
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: function() { return this.testMode === 'offline'; }
  }, // Reference to the User model if created offline
  isDeleted: { 
    type: Boolean, 
    default: false 
  } // Soft delete option to mark as deleted
}, { timestamps: true });

// Create and export the StudentMarks model
const StudentMarks = mongoose.model('StudentMarks', StudentMarksSchema);

module.exports = StudentMarks;
