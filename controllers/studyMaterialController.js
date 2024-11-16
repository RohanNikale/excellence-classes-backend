const express = require('express');
const StudyMaterial = require('../models/studyMaterialModel');

exports.createStudyMaterial = async (req, res) => {
  try {
    const studyMaterial = new StudyMaterial({
      title: req.body.title,
      description: req.body.description,
      subject: req.body.subject,
      batch: req.body.batch,
      materialType: req.body.materialType,
      filePath: req.body.materialType === 'YT-Videos' ? '' : req.body.fileLink,
      ytVideo: req.body.materialType === 'YT-Videos' ? req.body.ytVideo : '',
      fileType: req.body.fileType,
      uploadedBy: req.user._id,
    });
    await studyMaterial.save();
    res.status(201).send({ message: 'Study material uploaded successfully!' });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

// Controller: getAllStudyMaterials
exports.getAllStudyMaterials = async (req, res) => {
  try {
    const { materialType } = req.query;
    let filter = {};

    // If the user is a student, use batch ID from req.user.batch
    if (req.user.role === 'student') {
      filter.batch = req.user.batch;
    } else {
      // For non-student roles, require batch ID from the request params
      const { batch } = req.params;
      if (!batch) {
        return res.status(400).send({ message: 'Batch ID is required for non-student roles.' });
      }
      filter.batch = batch;
    }

    // Add materialType filter if provided
    if (materialType) {
      filter.materialType = materialType;
    }

    // Fetch study materials with the applied filters
    const studyMaterials = await StudyMaterial.find(filter).populate('uploadedBy', 'batch');

    // Check if any study materials are found
    if (!studyMaterials || studyMaterials.length === 0) {
      return res.status(200).send([]);
    }

    res.status(200).send(studyMaterials);
  } catch (error) {
    console.error('Error fetching study materials:', error.stack || error);
    res.status(500).send({ message: 'An error occurred while fetching study materials. Please try again later.' });
  }
};



exports.getStudyMaterialById = async (req, res) => {
  try {
    const id = req.params.id;
    const studyMaterial = await StudyMaterial.findById(id).populate('uploadedBy', 'batch');
    if (!studyMaterial) {
      return res.status(404).send({ message: 'Study material not found!' });
    }
    res.status(200).send(studyMaterial);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

exports.updateStudyMaterial = async (req, res) => {
  try {
    const id = req.params.id;
    const studyMaterial = await StudyMaterial.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!studyMaterial) {
      return res.status(404).send({ message: 'Study material not found!' });
    }
    res.status(200).send(studyMaterial);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

exports.deleteStudyMaterial = async (req, res) => {
  try {
    // Check if the user is a teacher
    if (req.user.role === 'teacher') {
      let material = await StudyMaterial.findById(req.params.id);

      // Check if the teacher is the one who uploaded the material
      if (material.uploadedBy.toString() !== req.user._id.toString()) {
        return res.status(403).send({ message: 'You don’t have permission to delete this material.' });
      }
    }

    // Delete the study material
    const id = req.params.id;
    await StudyMaterial.findByIdAndDelete(id);

    // Return success message
    res.status(200).send({ message: 'Study material deleted successfully!' });

  } catch (error) {
    // Handle any errors that occur
    res.status(400).send({ message: error.message });
  }
};


exports.getStudyMaterialsBySubject = async (req, res) => {
  try {
    const subject = req.params.subject;
    const studyMaterials = await StudyMaterial.find({ subject }).populate('uploadedBy', 'batch');
    res.status(200).send(studyMaterials);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

exports.getStudyMaterialsByBatch = async (req, res) => {
  try {
    const batchId = req.params.batchId;
    const studyMaterials = await StudyMaterial.find({ batch: batchId }).populate('uploadedBy', 'batch');
    res.status(200).send(studyMaterials);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};