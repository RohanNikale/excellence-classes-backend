const mongoose = require('mongoose');

const OfflineTestSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Name or title of the offline test
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true }, // Reference to batch taking the test
  subject: { type: String, required: true }, // Subject of the test
  testDate: { type: Date, required: true }, // Date when the test will be conducted
  startTime: { type: String, required: true }, // Time the test starts
  durationMinutes: { type: Number, required: true }, // Duration of the test in minutes
  classroom: { type: String }, // Classroom or location where test will be held
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Creator of the test
  additionalNotes: { type: String }, // Any special instructions
  totalMarks: { type: Number, required: true }, // Total marks of the test
  resultDeclared: { type: Boolean, default: false }, // Indicates if the result has been declared
}, { timestamps: true });

// Compile schema into a model
const OfflineTest = mongoose.model('OfflineTest', OfflineTestSchema);

module.exports = OfflineTest;
