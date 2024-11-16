const axios = require('axios');
require('dotenv').config(); // Load environment variables

/**
 * Middleware to send WhatsApp template messages
 * @returns {function} Express middleware
 */
function sendWhatsAppNotificationMiddleware() {
  return async (req, res, next) => {
    try {
      const { recipientPhoneNumber, templateName, templateLanguage, templateParams } = req.body;

      if (!recipientPhoneNumber || !templateName || !templateParams) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const accessToken = process.env.WHATSAPP_API_ACCESS_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (!accessToken || !phoneNumberId) {
        return res.status(500).json({ error: "Configuration missing in .env" });
      }

      const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      const data = {
        messaging_product: 'whatsapp',
        to: recipientPhoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: templateLanguage || 'en', // Default to English
          },
          components: [
            {
              type: 'body',
              parameters: templateParams.map((param) => ({
                type: 'text',
                text: param,
              })),
            },
          ],
        },
      };

      const response = await axios.post(url, data, { headers });
      console.log('Notification sent successfully:', response.data);
      res.status(200).json({ success: true, data: response.data });
    } catch (error) {
      console.error('Error sending notification:', error.response?.data || error.message);
      res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
  };
}

module.exports = sendWhatsAppNotificationMiddleware;
