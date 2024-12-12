// Import necessary modules and models
const Salary = require('../models/SalarySchema'); // Assuming you have a Salary model
const sendWhatsAppSalaryPaymentNotification = require('../middlewares/sendWhatsAppSalaryPaymentNotification'); // Import the WhatsApp notification function

// Controller function to bulk update payment details, salaries, and statuses
const bulkUpdatePaymentDetails = async (req, res) => {
  try {
    // Extract bulk update details from request body
    const { updates } = req.body;

    // Validate required fields
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'An array of updates is required.',
      });
    }

    // Prepare bulk operations
    const bulkOps = updates.map((update) => {
      const { salaryId, paymentMethod, status, salary } = update;

      // Validate individual update fields
      if (!salaryId || !paymentMethod || !status || salary == null) {
        throw new Error('Salary ID, payment method, status, and salary are required for each update.');
      }

      return {
        updateOne: {
          filter: { _id: salaryId },
          update: { paymentMethod, status, salary },
        },
      };
    });

    // Execute bulk operations
    const result = await Salary.bulkWrite(bulkOps);

    // Send a success response
    res.status(200).json({
      success: true,
      message: 'Payment details updated successfully.',
      data: result,
    });

    // Send WhatsApp notification if the status is "paid"
    for (const update of updates) {
      if (update.status === 'Paid') {
        const salary = await Salary.findById(update.salaryId).populate('user', 'name personalContactNumber role'); // Populate user details
        if (salary) {
          // Send WhatsApp notification
          await sendWhatsAppSalaryPaymentNotification(
            `91${salary.user.personalContactNumber}`, // Employee phone number
            salary.user.name,                  // Employee name
            salary.salary,                     // Payment amount
            new Date(),                        // Payment date
            salary.paymentMethod,              // Payment method
            salary.user.role || 'Employee', // Employee designation
            process.env.INSTITUTE_NAME,        // Institute name
            process.env.SUPPORT_PHONE_NUMBER   // Support phone number
          );
        }
      }
    }
  } catch (error) {
    // Handle errors
    console.error('Error updating payment details in bulk:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error.',
    });
  }
};

const getAllSalaries = async (req, res) => {
  try {
    // Extract month and year from request query
    const { month, year } = req.query;

    // Validate required fields
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required.',
      });
    }

    // Fetch salary records for the given month and year, populating user details
    const salaries = await Salary.find({
      month: parseInt(month, 10),
      year: parseInt(year, 10),
    }).populate('user', 'name role'); // Adjust fields ('name email') as needed from the User schema

    // Send a success response
    res.status(200).json({
      success: true,
      message: 'Salaries fetched successfully.',
      data: salaries,
    });
  } catch (error) {
    // Handle errors
    console.error('Error fetching salaries:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

const getUserSalaryHistory = async (req, res) => {
  try {
    // Extract user ID from request parameters
    const userIdFromParams = req.params.userId;

    // Extract user ID from request user context
    const userIdFromContext = req.user._id;

    // Check if the logged-in user is an admin
    if (req.user.role === 'admin') {
      // If user is an admin, use the user ID from params
      userId = userIdFromParams;
    } else {
      // If user is not an admin, use their own user ID
      userId = userIdFromContext;
    }

    const { page = 1, limit = 10 } = req.query; // Extract page and limit from query, default to page 1 and limit 10

    // Convert page and limit to integers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Fetch salary records for the user with pagination
    const salaryHistory = await Salary.find({ user: userId })
      .sort({ paymentDate: -1 }) // Sort by payment date in descending order
      .populate('user', 'name role') // Populate user details
      .skip((pageNum - 1) * limitNum) // Skip records for pagination
      .limit(limitNum); // Limit the number of records returned

    // Get total count of salary records
    const totalRecords = await Salary.countDocuments({ user: userId });

    // Calculate total pages
    const totalPages = Math.ceil(totalRecords / limitNum);

    // Send a success response with pagination information
    res.status(200).json({
      success: true,
      message: 'Salary payment history fetched successfully.',
      data: salaryHistory,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    // Handle errors
    console.error('Error fetching salary payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};


// Export the controllers
module.exports = {
  bulkUpdatePaymentDetails,
  getAllSalaries,
  getUserSalaryHistory
};
