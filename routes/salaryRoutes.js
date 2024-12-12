const express = require('express');
const router = express.Router();
const { bulkUpdatePaymentDetails, getAllSalaries,getUserSalaryHistory } = require('../controllers/salaryController');
const { auth } = require('../middlewares/authMiddleware');

router.put('/update-payment-details', auth(['admin']), bulkUpdatePaymentDetails);
router.get('/all-salaries', auth(['admin']), getAllSalaries);
router.get('/salary-payment-history/:userId', auth(['admin', 'teacher']), getUserSalaryHistory);

module.exports = router;
