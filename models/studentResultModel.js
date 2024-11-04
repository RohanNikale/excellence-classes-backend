const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Test',
  },
  marks: {
    type: Number,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  examType: {
    type: String,
    enum: ['online', 'offline'],
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.examType === 'offline';
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  examDate: {
    type: Date,
  },
  feedback: {
    type: String,
  },
  subject: {
    type: String,
  },
  isPassed: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

// Create and export the Marks model
const Marks = mongoose.model('Marks', marksSchema);
module.exports = Marks;
