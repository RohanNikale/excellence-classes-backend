const nodemailer = require('nodemailer');

/**
 * Sends a salary payment notification email to an employee.
 * 
 * @param {string} employeeEmail - Email of the employee.
 * @param {string} employeeName - Name of the employee.
 * @param {number} paymentAmount - Amount paid to the employee.
 * @param {string} paymentDate - Date of the payment.
 * @param {string} paymentMethod - Method of payment (e.g., Bank Transfer, Cash).
 * @param {string} employeeDesignation - Employee's designation.
 * @param {string} instituteName - Name of the organization.
 * @param {string} supportPhoneNumber - Support contact number.
 * @param {number} advanceAmount - Advance paid to the employee (default: 0).
 * @param {number} bonusAmount - Bonus paid to the employee (default: 0).
 * @returns {Promise<string>} - Returns a promise with the email response or an error.
 */
async function sendSalaryPaymentNotificationEmail(
  employeeEmail,
  employeeName,
  paymentAmount,
  paymentDate,
  paymentMethod,
  employeeDesignation,
  supportPhoneNumber,
  advanceAmount = 0,
  bonusAmount = 0
) {
  // Validate input parameters
  if (!employeeEmail || !employeeName || !paymentAmount || !paymentDate ||
      !paymentMethod || !employeeDesignation || !supportPhoneNumber) {
    console.error('Error: Missing required parameters');
    throw new Error('Missing required parameters');
  }

  // Configure transporter for Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,    // Your Gmail email
      pass: process.env.GMAIL_PASSWORD // Your Gmail password or App Password
    }
  });

  // Prepare email options with a professional HTML design
  const mailOptions = {
    from: `"Excellence Coaching Classes" <${process.env.GMAIL_EMAIL}>`, // Sender name and email
    to: employeeEmail, // Recipient email
    subject: 'Salary Payment Confirmation',
    text: `Hello ${employeeName},\n\nWe are pleased to inform you that your salary payment of ${paymentAmount} has been processed on ${paymentDate} via ${paymentMethod}.\n\nAdvance Paid: ${advanceAmount}\nBonus: ${bonusAmount}\n\nThank you for your contributions as our ${employeeDesignation}.\n\nFor any queries, feel free to contact us at ${supportPhoneNumber}.\n\nBest regards,\nExcellence Coaching Classes`, // Fallback plain text
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; background-color: #5a4d91; padding: 15px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0;">Excellence Coaching Classes</h1>
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #5a4d91;">Hello ${employeeName},</h2>
          <p style="font-size: 16px;">
            We are pleased to inform you that your salary payment has been processed successfully.
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 16px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment Amount:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${paymentAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment Date:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${paymentDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment Method:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Designation:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${employeeDesignation}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Advance Paid:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${advanceAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Bonus:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${bonusAmount}</td>
            </tr>
          </table>
          <p style="font-size: 16px;">Thank you for your hard work and contributions as our valued ${employeeDesignation}.</p>
          <p style="font-size: 16px;">For any queries, feel free to contact us at <strong>+91 9834997426 or +91 9156337739</strong>.</p>
          <p style="margin-top: 20px; font-size: 16px;">Best regards,</p>
          <p style="font-size: 16px; color: #5a4d91; font-weight: bold;">Excellence Coaching Classes</p>
        </div>
        <div style="text-align: center; font-size: 12px; color: #888; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
          <p>&copy; 2024 Excellence Coaching Classes. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Salary payment notification sent to ${employeeEmail}:`, info.response);
    return info.response;
  } catch (error) {
    console.error(`Error sending email to ${employeeEmail}:`, error.message);
    throw error;
  }
}

module.exports = sendSalaryPaymentNotificationEmail;
