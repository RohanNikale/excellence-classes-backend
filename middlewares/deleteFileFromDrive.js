const { google } = require('googleapis');
const path = require('path');

// Authentication setup
const keyFilePath = path.join(__dirname, '..', 'config', 'excellence-coaching-centre-03318aed9cbe.json');

const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Deletes a file from Google Drive using its URL.
 * @param {string} fileUrl - The Google Drive file URL.
 * @returns {Promise<void>} - Resolves if the file is deleted successfully.
 */
const deleteDriveFileByUrl = async (fileUrl) => {
  try {
    // Extract the file ID from the URL
    const match = fileUrl.match(/\/d\/(.*?)\//);
    if (!match || !match[1]) {
      throw new Error('Invalid Google Drive file URL.');
    }
    const fileId = match[1];

    // Delete the file from Google Drive
    await drive.files.delete({ fileId });
    console.log(`File with ID ${fileId} deleted successfully.`);
  } catch (err) {
    console.error('Error deleting file from Google Drive:', err.message);
    throw new Error('Failed to delete the file.');
  }
};
// deleteDriveFileByUrl("https://drive.google.com/file/d/1dEwTeHgc04JdLNR6qC3x79Q3fjmWnwou/view")

module.exports = deleteDriveFileByUrl;
