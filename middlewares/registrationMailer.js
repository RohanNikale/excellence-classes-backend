const nodemailer = require('nodemailer');

/**
 * Sends a registration email with login credentials.
 * 
 * @param {string} recipientEmail - Email address of the user.
 * @param {string} recipientName - Name of the user.
 * @param {string} role - Role of the user (e.g., student, teacher, admin).
 * @param {string} loginEmail - Email for login.
 * @param {string} loginPassword - Password for login.
 * @returns {Promise<string>} - Returns the email response or throws an error.
 */
async function sendRegistrationEmail(
  recipientEmail,
  recipientName,
  role,
  loginEmail,
  loginPassword
) {
  // Configure transporter for Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL, // Your Gmail email
      pass: process.env.GMAIL_PASSWORD, // Your Gmail password or App Password
    },
  });

  // Define role-based designation
  let designation = '';
  if (role === 'student') {
    designation = 'Student';
  } else if (role === 'teacher') {
    designation = 'Teacher';
  } else if (role === 'staff') {
    designation = 'Staff Member';
  } else if (role === 'admin') {
    designation = 'Administrator';
  }

  // Prepare email content based on the role
  const subject =
    role === 'student'
      ? 'Welcome to Excellence Coaching Classes - Registration Confirmation'
      : `Welcome to Excellence Coaching Classes Team - ${designation} Registration`;

  const textMessage =
    role === 'student'
      ? `Dear ${recipientName},

Welcome to Excellence Coaching Classes!

You have been successfully registered as a ${designation}. Below are your login credentials for the ECC App:

ECC App Email: ${loginEmail}
ECC App Password: ${loginPassword}

Please log in to your account and update your password after the first login for security purposes.

If you have any questions or need assistance, feel free to contact us.

Best regards,
Excellence Coaching Classes Team`
      : `Dear ${recipientName},

Welcome to Excellence Coaching Classes!

You have been successfully registered as a ${designation}. Below are your login credentials for the ECC App:

ECC App Email: ${loginEmail}
ECC App Password: ${loginPassword}

Please log in to your account and update your password after the first login for security purposes.

If you have any questions or need assistance, feel free to reach out to us.

Best regards,
Excellence Coaching Classes Team`;

  const htmlMessage =
    role === 'student'
      ? `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; background-color: #5a4d91; padding: 15px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0;">Welcome to Excellence Coaching Classes</h1>
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #5a4d91;">Dear ${recipientName},</h2>
          <p>We are excited to have you as a part of our learning community!</p>
          <p>As a <strong>${designation}</strong>, below are your login credentials for the <strong>ECC App</strong>:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 16px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>ECC App Email:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${loginEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>ECC App Password:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${loginPassword}</td>
            </tr>
          </table>
          <p>Please log in to your account and update your password after the first login for security purposes.</p>
          <p>If you have any questions or need assistance, feel free to contact us.</p>
          <p style="margin-top: 20px;">Best regards,</p>
          <p style="font-size: 16px; color: #5a4d91; font-weight: bold;">Excellence Coaching Classes Team</p>
        </div>
        <div style="text-align: center; font-size: 12px; color: #888; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
          <p>&copy; 2024 Excellence Coaching Classes. All rights reserved.</p>
        </div>
      </div>
      `
      : `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; background-color: #5a4d91; padding: 15px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0;">Welcome to Excellence Coaching Classes</h1>
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #5a4d91;">Dear ${recipientName},</h2>
          <p>We are thrilled to have you join our team as a <strong>${designation}</strong>!</p>
          <p>Below are your login credentials for the <strong>ECC App</strong>:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 16px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>ECC App Email:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${loginEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>ECC App Password:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${loginPassword}</td>
            </tr>
          </table>
          <p>Please log in to your account and update your password after the first login for security purposes.</p>
          <p>If you have any questions or need assistance, feel free to contact us.</p>
          <p style="margin-top: 20px;">Best regards,</p>
          <p style="font-size: 16px; color: #5a4d91; font-weight: bold;">Excellence Coaching Classes Team</p>
        </div>
        <div style="text-align: center; font-size: 12px; color: #888; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
          <p>&copy; 2024 Excellence Coaching Classes. All rights reserved.</p>
        </div>
      </div>
      `;

  const mailOptions = {
    from: `"Excellence Coaching Classes" <${process.env.GMAIL_EMAIL}>`,
    to: recipientEmail,
    subject,
    text: textMessage,
    html: htmlMessage,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Registration email sent to ${recipientEmail}:`, info.response);
    return info.response;
  } catch (error) {
    console.error(`Error sending email to ${recipientEmail}:`, error.message);
    throw error;
  }
}

module.exports = sendRegistrationEmail;
