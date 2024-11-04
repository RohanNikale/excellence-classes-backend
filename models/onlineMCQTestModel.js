const mongoose = require('mongoose');

const OnlineMCQTestSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Title of the test
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true }, // Array of batch IDs
    questions: [
        {
            questionText: { type: String, required: true }, // The question text
            options: [{ type: String, required: true }], // Options for the question
            correctAnswer: { type: Number, required: true }, // Index of the correct answer
            marks: { type: Number, default: 1 } // Marks for the question
        }
    ],
    subject: { type: String, required: true }, // Title of the test
    testDate: { type: Date, required: true }, // Date when the test will be conducted
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // User who created the test
}, { timestamps: true });

const OnlineMCQTest = mongoose.model('OnlineMCQTest', OnlineMCQTestSchema);

module.exports = OnlineMCQTest;
