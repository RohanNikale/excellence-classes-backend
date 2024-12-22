const nodemailer = require('nodemailer');

async function sendAbsentNotificationEmail(parentEmail, parentName, studentName, studentClass, dateOfAbsence) {
  // Configure transporter for Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,    // Your Gmail email
      pass: process.env.GMAIL_PASSWORD // Your Gmail password or App Password
    }
  });

  // Prepare email options with a beautiful HTML design
  const mailOptions = {
    from: `"Excellence Coaching Classes" <${process.env.GMAIL_EMAIL}>`, // Sender name and email
    to: parentEmail, // Recipient email
    subject: 'Absent Notification',
    text: `Hello ${parentName},\n\nYour child ${studentName} from ${studentClass} was absent on ${dateOfAbsence}. Please take note.\n\nBest regards,\nExcellence Coaching Classes`, // Fallback plain text
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; background-color: #5a4d91; padding: 15px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0;">Excellence Coaching Classes</h1>
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #5a4d91;">Hello ${parentName},</h2>
          <p style="font-size: 16px;">
            This is to inform you that your child <strong>${studentName}</strong> <strong>${studentClass} Batch</strong> 
            was absent on <strong>${dateOfAbsence}</strong>.
          </p>
          <p style="font-size: 16px;">Please ensure to address this absence with your child to prevent any gaps in their education.</p>
          <p style="font-size: 16px;">If you have any questions, feel free to contact us.</p>
          <p style="font-size: 16px;">+91 9834997426 or +91 9156337739</p>

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
    console.log(`Absent notification sent to ${parentEmail}:`, info.response);
    return info.response;
  } catch (error) {
    console.error(`Error sending email to ${parentEmail}:`, error.message);
    throw error;
  }
}

module.exports = sendAbsentNotificationEmail;
