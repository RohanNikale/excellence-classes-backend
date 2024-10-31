// controllers/fileController.js
const { google } = require('googleapis');
const { PassThrough } = require('stream');
const path = require('path');

const keyFilePath = path.join(__dirname, '..', 'config', 'excellence-coaching-centre-03318aed9cbe.json');

const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

exports.uploadFile = async (req, res) => {
  try {
    const { file } = req;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileMetadata = {
      name: file.originalname,
      parents: ['1OP8zMlIACRz9kD1j-61CD7ijmwh5cchL'], // Replace with your Google Drive folder ID
    };

    const bufferStream = new PassThrough();
    bufferStream.end(file.buffer);

    const media = {
      mimeType: file.mimetype,
      body: bufferStream,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    const fileId = response.data.id;

    // Transform to direct image URL format
    const fileLink = `https://drive.google.com/uc?export=view&id=${fileId}`;

    res.status(201).json({ message: 'File uploaded successfully', fileLink });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
