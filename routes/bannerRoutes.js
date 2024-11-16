const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/bannerController");
const { auth } = require("../middlewares/authMiddleware");

// Apply the `auth` middleware to restrict access to admins only
router.post("/upload", auth(["admin"]), bannerController.uploadBannerImage, bannerController.addBanner); // Admins can upload banners
router.get("/", auth(["admin",'student','teacher']), bannerController.getAllBanners);                                       // Admins can view banners
router.delete("/:id", auth(["admin"]), bannerController.deleteBanner);                                  // Admins can delete banners

module.exports = router;