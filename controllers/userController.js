// controllers/userController.js
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");



// Get All Users Except Students (Admin Only)
exports.getAllUsersExceptStudents = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    // Find all users except those with the "student" role and only active or re-enrolled users
    const users = await User.find({ 
      role: { $ne: "student" },
      status: { $in: ["active", "re-enrolled"] } // Filter based on status
    }).select(["name", "teacherId", "personalContactNumber", "role"]).select("-password");

    if (!users.length) {
      return res.status(404).json({ message: "No users found except students" });
    }

    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users except students:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Profile by ID (Admin or Self)
exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    // Check if the requesting user has permission to access the profile
    if (req.user.role !== "admin" && req.user.id !== userId) {
      // Check if the user is a teacher trying to access a student profile
      if (req.user.role === "teacher") {
        const student = await User.findById(userId).select("status");

        // Ensure the student is active or re-enrolled
        if (!student || !["active", "re-enrolled"].includes(student.status)) {
          return res.status(403).json({ message: "Access denied to inactive or not re-enrolled student" });
        }
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Find user by ID and populate the batch
    const user = await User.findById(userId)
      .select("-password") // Exclude password
      .populate({
        path: 'batch',
        select: '_id name standard', // Include the fields you want from batch
        populate: {
          path: 'standard', // If the batch has a reference to the standard, populate that as well
          select: 'name' // Include only the name field from the standard
        }
      });

    // Check if user is found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove fees-related information if the user is a teacher
    if (req.user.role === "teacher") {
      user.totalFee = undefined;
      user.pendingFee = undefined;
      user.discount = undefined;
      user.feesDetails = undefined; // Assuming feesDetails is a field for detailed fees information
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};



exports.getStudentsByBatch = async (req, res) => {
  const { batchid } = req.params;

  try {
    const students = await User.find({
      role: "student",
      batch: batchid,
      status: { $in: ["active", "re-enrolled"] } // Only include active or re-enrolled students
    })
    .select(["name", "studentId", "personalContactNumber"]) // Only include the ID and name fields
    .select("-password"); // Exclude password from the results

    if (!students.length) {
      return res.status(404).json({ message: "No students found for this batch" });
    }

    res.status(200).json(students);
  } catch (err) {
    console.error("Error fetching students by batch:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getFeesByBatch = async (req, res) => {
  const { batchid } = req.params;

  try {
    const students = await User.find({
      role: "student",
      batch: batchid,
      status: { $in: ["active", "re-enrolled"] } // Only include active or re-enrolled students
    })
    .select(["name", "studentId", "personalContactNumber", "pendingFee", "status"]) // Only include the ID and name fields
    .select("-password"); // Exclude password from the results

    if (!students.length) {
      return res.status(404).json({ message: "No students found for this batch" });
    }

    res.status(200).json(students);
  } catch (err) {
    console.error("Error fetching students by batch:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get All Users (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const { role } = req.params;
    console.log(role);

    // Create a query to find users, filtered by role and status if provided
    const query = {
      ...(role ? { role } : {})
    };

    // Find users, selecting only the required fields
    const users = await User.find(query).select("_id name personalContactNumber pendingFee studentId status");

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

// controllers/userController.js
exports.deleteUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    // Check if the user has admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Use deleteOne() on the user instance to trigger the pre-delete middleware
    await user.deleteOne();

    res.status(200).json({ message: "User profile and related records deleted successfully" });
  } catch (err) {
    console.error("Error in deleteUserProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

