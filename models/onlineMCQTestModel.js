const mongoose = require('mongoose');
const StudentMarks = require('./StudentMarksModel'); // Assuming StudentMarks model is in the same directory

const OnlineMCQTestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    questions: [
        {
            questionText: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctAnswer: { type: Number, required: true },
            marks: { type: Number, default: 1 }
        }
    ],
    subject: { type: String, required: true },
    testDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Middleware to delete related StudentMarks documents after test is deleted
OnlineMCQTestSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        try {
            // Remove all StudentMarks entries associated with this test
            await StudentMarks.deleteMany({ testId: doc._id });
        } catch (error) {
            console.error('Error deleting related StudentMarks:', error);
        }
    }
});

const OnlineMCQTest = mongoose.model('OnlineMCQTest', OnlineMCQTestSchema);

module.exports = OnlineMCQTest;
