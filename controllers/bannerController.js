const Banner = require('../models/bannerModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Set the upload folder to 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use a unique filename based on timestamp
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Middleware for file upload
exports.uploadBannerImage = upload.single('image');

// Add a new banner
exports.addBanner = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !req.file) {
      return res.status(400).json({ message: 'Title and image are required.' });
    }

    // Save banner to database
    const banner = new Banner({
      title,
      image: `/uploads/${req.file.filename}`, // Store the relative path to image
    });

    await banner.save();
    res.status(201).json({ message: 'Banner uploaded successfully!', banner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all banners
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.status(200).json(banners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a banner by ID
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the banner by ID
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found.' });
    }

    // Delete the image file from the server
    const imagePath = path.join(__dirname, '..', banner.image); // Relative path
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error deleting the file:', err);
      }
    });

    // Delete the banner from the database
    await Banner.findByIdAndDelete(id);

    res.status(200).json({ message: 'Banner deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
