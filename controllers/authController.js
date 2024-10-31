// authController.js
const User = require("../models/userModel");
const Batch = require("../models/batchModel");
const FeePayment = require("../models/FeePaymentModel"); // Import Payment model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateUniqueId = require('../middlewares/generateUniqueId')
// Register User
exports.registerUser = async (req, res) => {
  const { 
      name, 
      email, 
      password, 
      role, 
      address, 
      profileImage, 
      personalContactNumber, 
      emergencyContactNumber, 
      dateOfBirth, 
      gender, 
      parentName, 
      parentContactNumber, 
      relationshipToGuardian, 
      batch, 
      discount, 
      paidFee, // New field for initial payment at registration
      salary, // Salary field for staff
      salaryType // Salary type (monthly or daily)
  } = req.body;

  try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate unique ID based on role
      let studentId, teacherId, adminId;
      if (role === "student") {
          studentId = await generateUniqueId("student");
      } else if (role === "teacher") {
          teacherId = await generateUniqueId("teacher");
      } else if (role === "admin") {
          adminId = await generateUniqueId("admin");
      }

      // Initialize total fee and pending fee
      let totalFee = 0;
      let pendingFee = 0;

      // If the user is a student and batch is provided, fetch the batch
      if (role === "student" && batch) {
          const batchDetails = await Batch.findById(batch).populate("standard");
          if (batchDetails) {
              if (batchDetails.standard && batchDetails.standard.fee) {
                  totalFee = batchDetails.standard.fee;
                  pendingFee = totalFee - (discount || 0);
                  if (paidFee && paidFee > 0) {
                      pendingFee -= paidFee;
                  }
              }
          }
      }

      // Create the user object with status set to "active"
      const newUser = new User({
          name,
          email,
          address,
          password: hashedPassword,
          profilePic: profileImage,
          role,
          status: "active", // Set status to "active" by default
          personalContactNumber,
          emergencyContactNumber,
          dateOfBirth, 
          gender,
          batch: role === "student" || role === "teacher" ? batch : undefined,
          ...(role === "student" && { studentId, totalFee, pendingFee, discount, parentName, parentContactNumber, relationshipToGuardian }),
          ...((role !== "student") && { 
              salary, 
              salaryType,
              ...(role === "teacher" && { teacherId }), 
              ...(role === "admin" && { adminId })
          }),
      });

      await newUser.save();

      if (role === "student" && paidFee > 0) {
          const paymentEntry = new FeePayment({
              student: newUser._id,
              amount: paidFee,
              method: "cash",
          });
          await paymentEntry.save();
      }

      if (role === "student" && batch) {
          await Batch.findByIdAndUpdate(batch, { $push: { students: newUser._id } });
      }

      res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user and populate batch and standard fields
    const user = await User.findOne({ email })
      .populate({
        path: "batch",
        populate: { path: "standard" },
      });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check if user status is active or re-enrolled
    if (user.status !== "active" && user.status !== "re-enrolled") {
      return res.status(403).json({ message: "Account not active. Contact admin for assistance." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7h" }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ token, profile: userWithoutPassword });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Update User Status (Admin Only)
exports.updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User status updated successfully", user });
  } catch (err) {
    console.error("Error updating user status:", err);
    res.status(500).json({ message: "Server error" });
  }
};
