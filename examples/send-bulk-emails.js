/**
 * Example: Send Bulk Emails
 * Demonstrates how to send bulk/mass emails with rate limiting
 */

const EmailService = require('../services/EmailService');

async function sendBulkEmails() {
  try {
    // Initialize email service
    const emailService = new EmailService();
    
    // Verify configuration
    const verification = await emailService.verifyConfiguration();
    if (!verification.valid) {
      console.error('Invalid configuration:', verification.errors);
      return;
    }
    
    // Prepare list of recipients
    // In production, this would come from your database
    const recipients = [
      { email: 'user1@example.com', name: 'John Doe' },
      { email: 'user2@example.com', name: 'Jane Smith' },
      { email: 'user3@example.com', name: 'Bob Johnson' },
      // Add more recipients...
    ];
    
    // Prepare email messages
    const messages = recipients.map(recipient => ({
      to: recipient.email,
      subject: 'Important Update - Monthly Newsletter',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #0066cc;">Hello ${recipient.name}!</h1>
            <p>Here's your monthly newsletter with the latest updates.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h2 style="margin-top: 0;">This Month's Highlights</h2>
              <ul>
                <li>New feature released</li>
                <li>Performance improvements</li>
                <li>Security updates</li>
              </ul>
            </div>
            
            <p>Thank you for being a valued subscriber!</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
              You're receiving this email because you subscribed to our newsletter.
              <br>
              <a href="https://yourdomain.com/unsubscribe?email=${encodeURIComponent(recipient.email)}">Unsubscribe</a>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${recipient.name}!
        
        Here's your monthly newsletter with the latest updates.
        
        This Month's Highlights:
        - New feature released
        - Performance improvements
        - Security updates
        
        Thank you for being a valued subscriber!
        
        Unsubscribe: https://yourdomain.com/unsubscribe?email=${encodeURIComponent(recipient.email)}
      `
    }));
    
    // Send bulk emails with rate limiting and batching
    console.log(`Preparing to send ${messages.length} emails...`);
    console.log('Rate limit:', emailService.config.rateLimit, 'emails/second');
    console.log('Batch size:', emailService.config.batchSize);
    
    const results = await emailService.sendBulkEmails(messages);
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\n=== Bulk Email Summary ===');
    console.log(`Total: ${results.length}`);
    console.log(`✓ Successful: ${successful}`);
    console.log(`✗ Failed: ${failed}`);
    
    // Show failed emails
    if (failed > 0) {
      console.log('\nFailed emails:');
      results
        .filter(r => !r.success)
        .forEach((r, i) => {
          console.log(`${i + 1}. Error: ${r.error}`);
        });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the example
sendBulkEmails();
