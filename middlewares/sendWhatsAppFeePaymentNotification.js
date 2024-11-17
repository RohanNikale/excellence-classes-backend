const axios = require('axios');

async function sendWhatsAppFeePaymentNotification(
  parentPhoneNumber,
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
  const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const headers = {
    'Authorization': `Bearer ${process.env.WHATSAPP_API_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const data = {
    messaging_product: 'whatsapp',
    to: parentPhoneNumber,
    type: 'template',
    template: {
      name: 'fee_payment_confirmation',
      language: {
        code: 'en',
      },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: parentName },
            { type: 'text', text: paymentAmount },
            { type: 'text', text: studentName },
            { type: 'text', text: studentClass },
            { type: 'text', text: batchName },
            { type: 'text', text: paymentDate },
            { type: 'text', text: pendingFee },
            { type: 'text', text: supportPhoneNumber },
            { type: 'text', text: instituteName },
          ],
        },
      ],
    },
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log('Fee payment notification sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = sendWhatsAppFeePaymentNotification;
