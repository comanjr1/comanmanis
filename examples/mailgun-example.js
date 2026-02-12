/**
 * Example: Using Mailgun
 * Configuration for Mailgun email service
 */

// .env configuration for Mailgun
/*
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FROM_EMAIL=noreply@yourdomain.com
MAILGUN_FROM_NAME=Your Company Name
EMAIL_REPLY_TO=support@yourdomain.com
EMAIL_UNSUBSCRIBE_URL=https://yourdomain.com/unsubscribe
EMAIL_TRACK_OPENS=true
EMAIL_TRACK_CLICKS=true
*/

const EmailService = require('../services/EmailService');

async function sendWithMailgun() {
  try {
    const emailService = new EmailService();
    
    console.log('Using Mailgun as email provider');
    
    const result = await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test Email via Mailgun',
      html: '<h1>Hello from Mailgun!</h1><p>This is a test email.</p>',
      text: 'Hello from Mailgun! This is a test email.'
    });
    
    console.log('Result:', result);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Install Mailgun package: npm install mailgun.js form-data');
    console.log('2. Verify your Mailgun API key and domain');
    console.log('3. Check Mailgun dashboard for more details');
  }
}

if (require.main === module) {
  sendWithMailgun();
}

module.exports = { sendWithMailgun };
