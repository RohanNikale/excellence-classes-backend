const axios = require('axios');

async function sendWhatsAppAbsentNotification(  parentPhoneNumber, parentName, studentName, studentClass, dateOfAbsence) {
  const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const headers = {
    'Authorization': `Bearer ${process.env.WHATSAPP_API_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };

  const data = {
    messaging_product: 'whatsapp',
    to: parentPhoneNumber,
    type: 'template',
    template: {
      name: 'attendace_update',
      language: {
        code: 'en'
      },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: parentName },
            { type: 'text', text: studentName },
            { type: 'text', text: studentClass },
            { type: 'text', text: dateOfAbsence }
          ]
        }
      ]
    }
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log('Absent notification sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error.response?.data || error.message);
    throw error;
  }
}
// sendAbsentNotificationWithStudentName('919021402272','pandit','rohan nikale','5th grade','10-10-2020')
module.exports = sendWhatsAppAbsentNotification;
