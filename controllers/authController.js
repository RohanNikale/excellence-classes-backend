// authController.js
const User = require("../models/userModel");
const Batch = require("../models/batchModel");
const FeePayment = require("../models/FeePaymentModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateUniqueId = require('../middlewares/generateUniqueId');
const sendRegistrationEmail = require('../middlewares/registrationMailer');

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
      paidFee, 
      salary, 
      salaryType,
      paymentMethod,
      teacherBatches,
      subjects // Only for teachers
  } = req.body;

  try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);

      let totalFee = 0;
      let pendingFee = 0;

      // Only generate studentId for students
      let studentId;
      if (role === "student") {
          studentId = await generateUniqueId("student");
          if (batch) {
              const batchDetails = await Batch.findById(batch).populate("standard");
              if (batchDetails?.standard?.fee) {
                  totalFee = batchDetails.standard.fee;
                  pendingFee = totalFee - (discount || 0);
                  if (paidFee && paidFee > 0) {
                      pendingFee -= paidFee;
                  }
              }
          }
      }

      // Prepare user object, conditionally adding fields based on role
      const newUser = new User({
        name,
        email,
        address,
        password: hashedPassword,
        profilePic: profileImage,
        role,
        status: "active",
        personalContactNumber,
        emergencyContactNumber,
        dateOfBirth, 
        gender,
        batch: role === "student" ? batch : undefined,
        teacherBatches: role === "teacher" ? teacherBatches : undefined,
        ...(role === "student" && { studentId, totalFee, pendingFee, discount, parentName, parentContactNumber, relationshipToGuardian }),
        ...(role !== "student" && { salary, salaryType }),
        ...(role === "teacher" && { subjects }) // Add subjects only for teachers
    });

      await newUser.save();

      // Create a fee payment record for the student if they have paid a fee
      if (role === "student" && paidFee > 0) {
          const transactionId = await generateUniqueId("transaction"); // Generate unique transaction ID
          
          const paymentEntry = new FeePayment({
              student: newUser._id,
              amount: paidFee,
              method: paymentMethod, // Assuming cash for manual payments; update as needed
              transactionId: transactionId,
              status: "completed", // Assuming completed status for initial registration fee
              currency: "INR", // Default currency
              createdBy: req.user ? req.user._id : null, // Store the user who created the payment
              memo: "Advance Fee Payment",
              paymentGateway: "manual" // Mark as manual payment since added by user
          });
          await paymentEntry.save();
      }

      // Send registration email for all roles (student, teacher, employee)
      try {


          await sendRegistrationEmail(
              email, // User's email
              name, // User's name
              role,
              email, // ECC App Email
              password // ECC App Password
          );
      } catch (emailError) {
          console.error("Error sending registration email:", emailError.message);
          // Log the error but don't fail registration
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
    const user = await User.findOne({ email })
      .populate({
        path: "batch",
        populate: { path: "standard" },
      })
      .populate("teacherBatches teacherBatches");

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.status !== "active" && user.status !== "re-enrolled") {
      return res.status(403).json({ message: "Account not active. Contact admin for assistance." });
    }

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
