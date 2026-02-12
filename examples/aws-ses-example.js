/**
 * Example: Using AWS SES
 * Configuration for Amazon Simple Email Service
 */

// .env configuration for AWS SES
/*
EMAIL_SERVICE=ses
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxxxxxxx
AWS_SES_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
AWS_SES_FROM_NAME=Your Company Name
EMAIL_REPLY_TO=support@yourdomain.com
*/

const EmailService = require('../services/EmailService');

async function sendWithSES() {
  try {
    const emailService = new EmailService();
    
    console.log('Using AWS SES as email provider');
    
    const result = await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test Email via AWS SES',
      html: '<h1>Hello from AWS SES!</h1><p>This is a test email.</p>',
      text: 'Hello from AWS SES! This is a test email.'
    });
    
    console.log('Result:', result);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Install AWS SDK: npm install @aws-sdk/client-ses');
    console.log('2. Verify AWS credentials and region');
    console.log('3. Verify sender email is verified in AWS SES');
    console.log('4. Check if AWS SES is in sandbox mode (only verified emails can receive)');
  }
}

if (require.main === module) {
  sendWithSES();
}

module.exports = { sendWithSES };
