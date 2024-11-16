const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

// Initialize Google Drive API client
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID, // Your Google Client ID
  process.env.CLIENT_SECRET, // Your Google Client Secret
  process.env.REDIRECT_URI // Your Redirect URI
);

// Set the access token (you should have a token, usually acquired after OAuth2 flow)
oauth2Client.setCredentials({
  access_token: process.env.ACCESS_TOKEN, // Replace with your access token or use a stored one
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

const deleteFileFromDrive = async (req, res, next) => {
  try {
    const fileId = req.params.fileId;

    // Check if fileId is provided
    if (!fileId) {
      return res.status(400).send({ message: 'File ID is required' });
    }

    // Delete the file from Google Drive using the API
    await drive.files.delete({
      fileId: fileId,
    });

    console.log('File deleted successfully from Google Drive');
    next(); // Proceed to the next middleware/controller (study material deletion)

  } catch (error) {
    console.error('Error deleting file from Google Drive:', error);
    res.status(500).send({ message: 'Error deleting file from Google Drive' });
  }
};

module.exports = deleteFileFromDrive;
