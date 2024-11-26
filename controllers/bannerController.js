const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const Banner = require('../models/bannerModel');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage configuration for direct upload to Cloudinary
const storage = multer.memoryStorage(); // Store the file in memory

const upload = multer({ storage });

// Middleware for file upload (to be used in routes)
exports.uploadBannerImage = upload.single('image');

// Banner upload function
exports.addBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required.' });
    }

    // Upload to Cloudinary directly from the buffer
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'banners', // Cloudinary folder name
        public_id: `${uuidv4()}-${req.file.originalname.split('.')[0]}`, // Generate unique file name
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
        }

        // Save banner info to the database
        const banner = new Banner({
          title: req.body.title,
          image: result.secure_url, // Cloudinary image URL
        });

        banner
          .save()
          .then(() => res.status(201).json({ message: 'Banner uploaded successfully!', banner }))
          .catch((dbError) => {
            console.error('Database save error:', dbError);
            res.status(500).json({ message: 'Failed to save banner to the database', error: dbError.message });
          });
      }
    );

    // Pipe the file buffer to Cloudinary uploader
    result.end(req.file.buffer);
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

// Delete banner function
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the banner by ID
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found.' });
    }

    // Extract the public ID from the Cloudinary URL
    const publicId = banner.image.split('/').slice(-2).join('/').split('.')[0];

    // Delete the image from Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.destroy(publicId);

    // Delete the banner from the database
    await Banner.findByIdAndDelete(id);

    res.status(200).json({ message: 'Banner and image deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
