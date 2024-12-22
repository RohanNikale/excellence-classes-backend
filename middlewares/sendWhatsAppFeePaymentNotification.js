const nodemailer = require('nodemailer');

/**
 * Sends a fee payment notification email to a parent.
 * 
 * @param {string} parentEmail - Email of the parent.
 * @param {string} parentName - Name of the parent.
 * @param {string} studentName - Name of the student.
 * @param {string} studentClass - Class of the student.
 * @param {string} batchName - Batch of the student.
 * @param {number} paymentAmount - Amount paid by the parent.
 * @param {string} paymentDate - Date of the payment.
 * @param {number} pendingFee - Pending fee after payment.
 * @param {string} supportPhoneNumber - Support contact number.
 * @param {string} instituteName - Name of the organization.
 * @returns {Promise<string>} - Returns a promise with the email response or an error.
 */
async function sendEmailFeePaymentNotification(
  parentEmail,
  parentName,
  studentName,
  studentClass,
  batchName,
  paymentAmount,
  paymentDate,
  pendingFee,
  supportPhoneNumber,
  instituteName
) {
  // Validate input parameters
  if (!parentEmail || !parentName || !studentName || !studentClass || 
      !batchName || !paymentAmount || !paymentDate || 
      pendingFee === undefined || !supportPhoneNumber || !instituteName) {
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
    to: parentEmail, // Recipient email
    subject: 'Fee Payment Confirmation',
    text: `Hello ${parentName},\n\nThis is to confirm the fee payment of ${paymentAmount} made on ${paymentDate} for your child ${studentName} (Class: ${studentClass}, Batch: ${batchName}).\n\nPending Fee: ${pendingFee}\n\nFor any queries, feel free to contact us at ${supportPhoneNumber}.\n\nBest regards,\nExcellence Coaching Classes`, // Fallback plain text
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; background-color: #5a4d91; padding: 15px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0;">Excellence Coaching Classes</h1>
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #5a4d91;">Hello ${parentName},</h2>
          <p style="font-size: 16px;">This is to confirm the successful fee payment for your child:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 16px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Student Name:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${studentName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Class:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${studentClass}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Batch:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${batchName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment Amount:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${paymentAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment Date:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${paymentDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Pending Fee:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${pendingFee}</td>
            </tr>
          </table>
          <p style="font-size: 16px;">For any queries, feel free to contact us at <strong>${supportPhoneNumber}</strong>.</p>
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
    console.log(`Fee payment notification sent to ${parentEmail}:`, info.response);
    return info.response;
  } catch (error) {
    console.error(`Error sending email to ${parentEmail}:`, error.message);
    throw error;
  }
}

module.exports = sendEmailFeePaymentNotification;
