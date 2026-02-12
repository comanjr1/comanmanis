/**
 * Example: Send Single Email
 * Demonstrates how to send a single email using the EmailService
 */

const EmailService = require('../services/EmailService');

async function sendSingleEmail() {
  try {
    // Initialize email service
    const emailService = new EmailService();
    
    // Verify configuration
    const verification = await emailService.verifyConfiguration();
    if (!verification.valid) {
      console.error('Invalid configuration:', verification.errors);
      return;
    }
    
    // Prepare email message
    const message = {
      to: 'recipient@example.com',
      subject: 'Welcome to Our Service!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #0066cc;">Welcome!</h1>
            <p>Thank you for signing up for our service.</p>
            <p>We're excited to have you on board.</p>
            <div style="margin: 30px 0;">
              <a href="https://yourdomain.com/getting-started" 
                 style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Get Started
              </a>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 40px;">
              If you didn't sign up for this service, you can safely ignore this email.
              <br>
              <a href="https://yourdomain.com/unsubscribe">Unsubscribe</a>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome!
        
        Thank you for signing up for our service.
        We're excited to have you on board.
        
        Get started: https://yourdomain.com/getting-started
        
        If you didn't sign up for this service, you can safely ignore this email.
        Unsubscribe: https://yourdomain.com/unsubscribe
      `
    };
    
    // Send email
    console.log('Sending email...');
    const result = await emailService.sendEmail(message);
    
    if (result.success) {
      console.log('✓ Email sent successfully!');
    } else {
      console.error('✗ Failed to send email:', result.error);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the example
sendSingleEmail();
