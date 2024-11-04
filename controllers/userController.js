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
exports.getUserBatches = async (req, res) => {
  const userId = req.user.role === "admin" ? req.params.userId : req.user._id; // Determine the user ID based on the role

  try {
    // Check permissions if the user is not an admin
    if (req.user.role !== "admin" && req.user._id.toString() !== userId.toString()) {
      if (req.user.role === "teacher") {
        // Fetch teacher details to confirm status
        const teacher = await User.findById(req.user._id).select("status");

        if (!teacher || !["active", "re-enrolled"].includes(teacher.status)) {
          return res.status(403).json({ message: "Access denied to inactive or not re-enrolled teacher" });
        }
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Find the user by ID and populate the batches
    const user = await User.findById(userId)
      .select("teacherBatches") // Select only the teacherBatches field
      .populate({
        path: 'teacherBatches',
        select: 'name standard startTime endTime', // Fields to include in the batch
        populate: {
          path: 'standard',
          select: 'name' // Include only the name field from the standard
        }
      });

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
    console.error("Error fetching user batches:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getStudentsByBatch = async (req, res) => {
  const { batchid } = req.params;
  const { role, teacherBatches } = req.user; // Get role and teacher's batches from req.user

  try {
    // Check if the role is 'teacher' and if the requested batch is in teacher's allowed batches
    if (role === "teacher" && !teacherBatches.includes(batchid)) {
      return res.status(403).json({ message: "Access denied: Teachers can only access their assigned batches" });
    }

    const students = await User.find({
      role: "student",
      batch: batchid,
      status: { $in: ["active", "re-enrolled"] } // Only include active or re-enrolled students
    })
    .select(["name", "studentId", "personalContactNumber"]) // Include selected fields
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

exports.searchUsers = async (req, res) => {
  try {
    // Destructure query parameters
    const { name, email, batch, studentId, role, status, page = 1, limit = 10, query } = req.query;

    // Determine role-based access
    const loggedInUserRole = req.user.role;

    // Only admins can access all users. If a teacher is logged in, restrict to students only.
    let searchRole;
    if (loggedInUserRole === "teacher") {
      searchRole = "student"; // Teachers can only search for students
    } else if (loggedInUserRole === "admin") {
      searchRole = role; // Admins can filter by any role, including all roles if role is not specified
    } else {
      return res.status(403).json({ message: "Access denied" }); // Restrict access for non-admin/teacher roles
    }

    // Validate specified role if present, and apply base role filter
    const validRoles = ["admin", "teacher", "student"];
    if (searchRole && searchRole !== "all" && !validRoles.includes(searchRole)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }
    
    // Construct the base query with applicable role and status
    const filterQuery = {
      ...(searchRole && searchRole !== "all" && { role: searchRole }),
      ...(status && status !== "all" && { status }), // Only include status if it's not "all"
      ...(name && { name: { $regex: name, $options: 'i' } }),
      ...(email && { email: { $regex: email, $options: 'i' } }),
      ...(batch && { batch: mongoose.Types.ObjectId(batch) }),
      ...(studentId && { studentId: { $regex: studentId, $options: 'i' } }),
      ...(query && { email: { $regex: query, $options: 'i' } }),
    };

    // Define fields to select based on role and logged-in user role
    let selectFields = "_id name email role status";
    if (searchRole === "student") {
      // Add student-specific fields, but exclude pendingFee if the user is a teacher
      selectFields += loggedInUserRole === "teacher" 
        ? " personalContactNumber studentId"
        : " personalContactNumber pendingFee studentId";
    } else if (searchRole === "teacher") {
      // Add teacher-specific fields
      selectFields += " personalContactNumber salary salaryType";
    }

    // Execute database queries with pagination
    const [users, totalUsers] = await Promise.all([
      User.find(filterQuery)
        .select(selectFields)
        .populate('batch', 'name') // Populate batch name if available
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      User.countDocuments(filterQuery)
    ]);

    // Return paginated results with role-based access
    res.status(200).json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: parseInt(page),
    });

  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({ message: "Server error" });
  }
};





exports.getAllUsers = async (req, res) => {
  try {
      // Check if the user has admin or teacher role
      if (req.user.role !== "admin" && req.user.role !== "teacher") {
          return res.status(403).json({ message: "Access denied: Only admins or teachers can access this resource" });
      }

      const { role } = req.params;
      
      // Pagination parameters
      const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
      const limit = parseInt(req.query.limit) || 10; // Default to 10 records per page
      const skip = (page - 1) * limit; // Calculate how many records to skip

      // Determine the query for filtering users
      const statusFilter = req.query.status; // Get the status from query parameters
      let query = {};

      // Set up the query based on role and status
      if (role && role !== "all") {
          query.role = role;
      } else if (req.user.role !== "admin") {
          // Only allow admins to fetch all roles
          return res.status(403).json({ message: "Access denied: Only admins can access all users" });
      }

      // Apply status filter if it is not "all"
      if (statusFilter && statusFilter !== "all") {
          if (["active",'resigned', "pending", "completed", "re-enrolled", "absconded", "postponed", "suspended", "withdrawn"].includes(statusFilter)) {
              query.status = statusFilter;
          } else {
              return res.status(400).json({ message: "Invalid status query" });
          }
      }

      // Determine which fields to select based on the role and user permissions
      let selectFields = "_id name personalContactNumber status";

      if (role === 'student') {
          selectFields += " studentId";
          if (req.user.role === 'admin') {
              selectFields += " pendingFee";
          }
      } else if (role === 'teacher') {
          selectFields += " salaryType salary";
      }

      // Find users, selecting only the required fields and applying pagination
      const users = await User.find(query)
          .select(selectFields)
          .skip(skip) // Skip the number of records
          .limit(limit); // Limit the number of records returned

      // Get total user count for pagination
      const totalUsers = await User.countDocuments(query);

      // Calculate total pages
      const totalPages = Math.ceil(totalUsers / limit);

      res.status(200).json({
          users,
          totalUsers,
          totalPages,
          currentPage: page,
      });
  } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ message: "Server error" });
  }
};




// Update User Profile (Admin Only)
exports.updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const {
    name,
    email,
    password,
    role,
    address,
    profilePic,
    personalContactNumber,
    emergencyContactNumber,
    dateOfBirth,
    gender,
    parentName,
    parentContactNumber,
    relationshipToGuardian,
    teacherBatches,
    subjects,
    salary,
    salaryType
  } = req.body;

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
    if (profilePic) user.profilePic = profilePic;
    if (personalContactNumber) user.personalContactNumber = personalContactNumber;
    if (emergencyContactNumber) user.emergencyContactNumber = emergencyContactNumber;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (parentName) user.parentName = parentName;
    if (parentContactNumber) user.parentContactNumber = parentContactNumber;
    if (relationshipToGuardian) user.relationshipToGuardian = relationshipToGuardian;
    if (teacherBatches) user.teacherBatches = teacherBatches;
    if (subjects) user.subjects = subjects;
    if (salary) user.salary = salary;
    if (salaryType) user.salaryType = salaryType;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error(err);
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

