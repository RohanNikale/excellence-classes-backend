// uniqueIdGenerator.js
const User = require('../models/userModel');

const generateUniqueId = async (role) => {
    let id;
    let unique = false;
    let digitCount = 8; // Start with 8 digits

    while (!unique) {
        // Generate a random ID based on the current digit count
        if (digitCount === 8) {
            id = Math.floor(Math.random() * 90000000 + 10000000).toString(); // Generate an 8-digit ID (10000000 to 99999999)
        } else if (digitCount === 9) {
            id = Math.floor(Math.random() * 900000000 + 100000000).toString(); // Generate a 9-digit ID (100000000 to 999999999)
        } else {
            id = Math.floor(Math.random() * Math.pow(10, digitCount) + Math.pow(10, digitCount - 1)).toString(); // Generate an ID with `digitCount` digits
        }

        // Check if the generated ID already exists
        const existingUser = await User.findOne(
            role === "student" ? { studentId: id } :
            role === "teacher" || "admin" ? { staffId: id } :
            { adminId: id }
        );

        if (!existingUser) {
            unique = true; // Unique ID found
        } else {
            // If all IDs of current digit count are used, switch to the next digit count
            if (digitCount === 8 && await User.countDocuments({ studentId: { $gte: "10000000", $lte: "99999999" } }) >= 90000000) {
                digitCount = 9; // Move to 9-digit IDs
            } else if (digitCount === 9 && await User.countDocuments({ studentId: { $gte: "100000000", $lte: "999999999" } }) >= 900000000) {
                digitCount = 10; // Move to 10-digit IDs
            }
            // You can continue this pattern for more digits if needed.
        }
    }

    return id;
};

// Export the function
module.exports = generateUniqueId;
