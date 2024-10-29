// controllers/userController.js
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

// Get User Profile by ID (Admin or Self)
exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Users (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update User Profile (Admin Only)
exports.updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { name, email, password, role,address } = req.body;
  
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role) user.role = role;
    console.log('enter')

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete User Profile (Admin Only)
exports.deleteUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User profile deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
