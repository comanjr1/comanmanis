/**
 * Example: Using SMTP
 * Configuration for generic SMTP server (Gmail, Outlook, etc.)
 */

// .env configuration for SMTP (Gmail example)
/*
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Your Company Name
EMAIL_REPLY_TO=support@yourdomain.com
*/

const EmailService = require('../services/EmailService');

async function sendWithSMTP() {
  try {
    const emailService = new EmailService();
    
    console.log('Using SMTP as email provider');
    
    const result = await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test Email via SMTP',
      html: '<h1>Hello from SMTP!</h1><p>This is a test email.</p>',
      text: 'Hello from SMTP! This is a test email.'
    });
    
    console.log('Result:', result);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Install nodemailer: npm install nodemailer');
    console.log('2. For Gmail: Enable 2FA and create App-Specific Password');
    console.log('3. Verify SMTP host, port, and credentials');
    console.log('4. Check firewall settings');
  }
}

// Different SMTP configurations
const smtpConfigs = {
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    note: 'Use App-Specific Password, not regular password'
  },
  outlook: {
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    note: 'Use Outlook account credentials'
  },
  yahoo: {
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
    note: 'Use App-Specific Password'
  },
  office365: {
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    note: 'Use Office 365 account credentials'
  },
  custom: {
    host: 'mail.yourdomain.com',
    port: 587,
    secure: false,
    note: 'Use your custom SMTP server'
  }
};

if (require.main === module) {
  console.log('Available SMTP configurations:');
  console.log(JSON.stringify(smtpConfigs, null, 2));
  console.log('\n');
  sendWithSMTP();
}

module.exports = { sendWithSMTP, smtpConfigs };
