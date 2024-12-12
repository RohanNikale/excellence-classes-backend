const { google } = require('googleapis');
const { PassThrough } = require('stream');

// Decode the base64-encoded Google Service Account credentials
const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_DRIVE_CREDENTIALS, 'base64').toString('utf8')
);

const auth = new google.auth.GoogleAuth({
  credentials,
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

    // Upload the file to Google Drive
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    const fileId = response.data.id;

    // Set file permissions to "Anyone with the link can view"
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Generate a link that displays the file in a web view
    const fileLink = `https://drive.google.com/file/d/${fileId}/view`;

    res.status(201).json({ message: 'File uploaded successfully', fileLink });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
