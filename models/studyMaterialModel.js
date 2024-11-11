const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
  },
  materialType: {
    type: String,
    required: true,
    enum: ['Notes', 'YT-Videos', 'E-Books','Previous-question-papers'],
  },
  filePath: {
    type: String,
  },
  ytVideo: {
    type: String,
  },
  fileType: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

studyMaterialSchema.path('filePath').validate(function() {
  return this.materialType !== 'YT-Videos' || this.filePath !== undefined;
}, 'File path is required for non-video materials');

studyMaterialSchema.path('ytVideo').validate(function() {
  return this.materialType === 'YT-Videos' || this.ytVideo !== undefined;
}, 'YouTube video link is required for video materials');

const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);

module.exports = StudyMaterial;