// utils/salaryCalculation.js

const StaffAttendance = require('../models/staffAttendanceModel');
const Salary = require('../models/SalarySchema');
const User = require('../models/userModel');

const calculateAndStoreSalary = async (month, year) => {
  // console.log(`Starting salary calculation for month: ${month}, year: ${year}`);

  // Fetch staff attendance and salary details
  const users = await User.find({ role: { $in: ["teacher", "admin"] } });
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  for (const user of users) {
    console.log(`User ID for ${user.name}: ${user._id}`);

    const attendance = await StaffAttendance.find({ 
      staff: user._id, 
      date: { 
        $gte: new Date(year, month - 1, 1), 
        $lte: new Date(year, month - 1, totalDaysInMonth)
      } 
    });

    const presentDays = attendance.filter(att => att.status === "present").length;
    const absentDays = totalDaysInMonth - presentDays;

    // console.log(`User: ${user.name}, Present: ${presentDays}, Absent: ${absentDays}`);

    const salary = user.salaryType === "daily" 
      ? presentDays * user.salary 
      : user.salary;

    // console.log(`Calculated Salary for ${user.name}: ${salary}`);

    // Save the salary record
    try {
      await Salary.create({
        user: user._id,
        salary,
        presentDays,
        absentDays,
        totalDaysInMonth,
        month,
        year
      });
      // console.log(`Salary record created for ${user.name}`);
    } catch (err) {
      // console.error(`Error saving salary for ${user.name}:`, err.message);
    }
  }
};

module.exports = { calculateAndStoreSalary };
