// authController.js
const User = require("../models/userModel");
const Batch = require("../models/batchModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User

exports.registerUser = async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    role, 
    address, 
    profileImage, 
    personalContactNumber, // Correct field name
    emergencyContactNumber, // Correct field name
    dateOfBirth, 
    gender, 
    parentName, 
    parentContactNumber, 
    relationshipToGuardian, 
    batch 
  } = req.body;

  console.log(req.body);
  
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user object
    const newUser = new User({
      name,
      email,
      address,
      password: hashedPassword,
      profilePic: profileImage,
      role,
      personalContactNumber, // Include this field
      emergencyContactNumber, // Include this field
      dateOfBirth, 
      gender,

      // Include batch field for students and teachers
      batch: role === "student" || role === "teacher" ? batch : undefined, 

      // Include additional fields only for students
      ...(role === "student" && {
        parentName,
        parentContactNumber,
        relationshipToGuardian,
      })
    });
    
    await newUser.save();

    // Add student to the batch's students array if the role is student
    if (role === "student" && batch) {
      await Batch.findByIdAndUpdate(batch, { $push: { students: newUser._id } });
    }

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7h",
    });
    const userData = {
      id: user._id,
      name: user.name, // Assuming user object has a 'name' field
      email: user.email,
      role: user.role,
      // Add any other fields you want to return
    };
    res.json({ token,profile:userData });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
