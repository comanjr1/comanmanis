/**
 * Example: Using SendGrid
 * Configuration for SendGrid email service
 */

// .env configuration for SendGrid
/*
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Your Company Name
EMAIL_REPLY_TO=support@yourdomain.com
EMAIL_UNSUBSCRIBE_URL=https://yourdomain.com/unsubscribe
EMAIL_TRACK_OPENS=true
EMAIL_TRACK_CLICKS=true
EMAIL_RATE_LIMIT=10
EMAIL_BATCH_SIZE=50
*/

const EmailService = require('../services/EmailService');

async function sendWithSendGrid() {
  try {
    // Initialize with SendGrid
    const emailService = new EmailService();
    
    console.log('Using SendGrid as email provider');
    
    // Send a test email
    const result = await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test Email via SendGrid',
      html: '<h1>Hello from SendGrid!</h1><p>This is a test email.</p>',
      text: 'Hello from SendGrid! This is a test email.'
    });
    
    console.log('Result:', result);
    
  } catch (error) {
    console.error('Error:', error.message);
    
    // Troubleshooting tips
    console.log('\nTroubleshooting:');
    console.log('1. Install SendGrid package: npm install @sendgrid/mail');
    console.log('2. Verify your SendGrid API key');
    console.log('3. Verify sender email is authenticated in SendGrid');
    console.log('4. Check SendGrid dashboard for more details');
  }
}

// SendGrid specific features
async function sendGridAdvancedFeatures() {
  const EmailService = require('../services/EmailService');
  const emailService = new EmailService();
  
  // Send email with custom categories and tags (for analytics)
  const message = {
    to: 'user@example.com',
    subject: 'Advanced SendGrid Features',
    html: '<h1>Hello!</h1>',
    // SendGrid-specific fields can be added in the message
    headers: {
      'X-Campaign': 'Newsletter-2024',
      'X-Customer-ID': '12345'
    }
  };
  
  await emailService.sendEmail(message);
}

// Run examples
if (require.main === module) {
  sendWithSendGrid();
}

module.exports = { sendWithSendGrid, sendGridAdvancedFeatures };
