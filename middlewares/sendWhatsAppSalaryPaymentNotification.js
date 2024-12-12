const axios = require('axios');

async function sendWhatsAppSalaryPaymentNotification(
  employeePhoneNumber,
  employeeName,
  paymentAmount,
  paymentDate,
  paymentMethod,
  employeeDesignation,
  instituteName,
  supportPhoneNumber
) {
  console.log('Sending notification');
  console.log({
    employeePhoneNumber,
    employeeName,
    paymentAmount,
    paymentDate,
    paymentMethod,
    employeeDesignation,
    instituteName,
    supportPhoneNumber,
  });
  
  // Validate input parameters
  if (!employeePhoneNumber || !employeeName || !paymentAmount || !paymentDate ||
      !paymentMethod || !employeeDesignation || !instituteName || !supportPhoneNumber) {
    console.error('Error: Missing required parameters');
    throw new Error('Missing required parameters');
  }

  const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_API_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const data = {
    messaging_product: 'whatsapp',
    to: employeePhoneNumber,
    type: 'template',
    template: {
      name: 'salary_payment_confirmation', // Name of the template registered in Meta
      language: {
        code: 'en',
      },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: employeeName }, // {{1}} - Employee Name
            { type: 'text', text: paymentAmount.toString() }, // {{2}} - Payment Amount
            { type: 'text', text: paymentDate }, // {{3}} - Payment Date
            { type: 'text', text: paymentMethod }, // {{4}} - Payment Method
            { type: 'text', text: employeeDesignation }, // {{5}} - Employee Designation
            { type: 'text', text: instituteName }, // {{6}} - Organization Name
            { type: 'text', text: supportPhoneNumber }, // {{7}} - Support Phone Number
          ],
        },
      ],
    },
  };

  // Log the payload to verify it matches the template
  console.log('Payload being sent:', JSON.stringify(data, null, 2));

  try {
    const response = await axios.post(url, data, { headers });
    console.log('Salary payment notification sent:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      'Error sending notification:',
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = sendWhatsAppSalaryPaymentNotification;
