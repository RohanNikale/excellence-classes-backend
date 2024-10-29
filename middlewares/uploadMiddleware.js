const multer = require("multer");

// Configure multer storage
const storage = multer.memoryStorage(); // Store files in memory

// Create the multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/; // Allowed file types
    const extname = fileTypes.test(file.mimetype);
    const mimetype = fileTypes.test(file.originalname.split('.').pop().toLowerCase());

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb("Error: File type not supported!");
  },
}).single("profileImage"); // Change "profileImage" to match your form input name

module.exports = upload;
