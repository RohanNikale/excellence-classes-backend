const cron = require('node-cron');
const { calculateAndStoreSalary } = require('../utils/salaryCalculation');

// Schedule the task to run every minute for testing purposes
cron.schedule('59 23 28-31 * *', async () => {
  // console.log('Cron job started for salary calculation.');

  const today = new Date();
  const testMonth = today.getMonth() + 1;  // Use current month
  const testYear = today.getFullYear();    // Use current year

  try {
    await calculateAndStoreSalary(testMonth, testYear);
    // console.log('Salary calculation');
  } catch (err) {
    // console.error('Error during salary calculation:', err.message);
  }
});
