# Konfigurasi Email Massal yang Andal
# Reliable Mass Email Sending Configuration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Sistem konfigurasi email lengkap untuk mengirim email massal yang andal dan memastikan email masuk ke inbox, bukan folder spam.

Complete email configuration system for reliable mass email sending that ensures emails land in inbox, not spam folder.

## 🎯 Fitur Utama / Key Features

- ✅ **Multi-Provider Support**: SendGrid, Mailgun, AWS SES, SMTP
- ✅ **Anti-Spam Configuration**: SPF, DKIM, DMARC guidelines
- ✅ **Rate Limiting**: Automatic rate limiting to prevent spam triggers
- ✅ **Retry Logic**: Automatic retry on failure with exponential backoff
- ✅ **Batch Processing**: Efficient bulk email sending with batching
- ✅ **Email Tracking**: Open and click tracking support
- ✅ **Plain Text Alternative**: Automatic HTML to plain text conversion
- ✅ **Unsubscribe Headers**: List-Unsubscribe header support
- ✅ **Professional Templates**: Ready-to-use email templates
- ✅ **Comprehensive Documentation**: Complete setup guides in English and Indonesian

## 📋 Persyaratan / Requirements

- Node.js >= 14.0.0
- Email service provider account (SendGrid, Mailgun, AWS SES, or SMTP)
- Domain with DNS access (for SPF, DKIM, DMARC configuration)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install dotenv

# Install your preferred email provider package
npm install @sendgrid/mail          # For SendGrid
# OR
npm install mailgun.js form-data    # For Mailgun
# OR
npm install @aws-sdk/client-ses     # For AWS SES
# OR
npm install nodemailer              # For SMTP
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your email service credentials:

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Your Company Name
EMAIL_REPLY_TO=support@yourdomain.com
EMAIL_UNSUBSCRIBE_URL=https://yourdomain.com/unsubscribe
```

### 3. Configure DNS Records

**PENTING / IMPORTANT**: Configure SPF, DKIM, and DMARC records to avoid spam folder!

See detailed instructions: [docs/ANTI_SPAM_CONFIGURATION.md](docs/ANTI_SPAM_CONFIGURATION.md)

### 4. Send Your First Email

```javascript
const EmailService = require('./services/EmailService');

const emailService = new EmailService();

await emailService.sendEmail({
  to: 'recipient@example.com',
  subject: 'Hello!',
  html: '<h1>Hello World!</h1><p>This is a test email.</p>',
  text: 'Hello World! This is a test email.'
});
```

## 📖 Documentation

### Configuration Guides

- **[Anti-Spam Configuration (Bahasa/English)](docs/ANTI_SPAM_CONFIGURATION.md)** - Complete guide to configure SPF, DKIM, DMARC

### Examples

- **[Send Single Email](examples/send-single-email.js)** - Basic single email sending
- **[Send Bulk Emails](examples/send-bulk-emails.js)** - Mass email with rate limiting
- **[SendGrid Example](examples/sendgrid-example.js)** - Using SendGrid
- **[Mailgun Example](examples/mailgun-example.js)** - Using Mailgun
- **[AWS SES Example](examples/aws-ses-example.js)** - Using AWS SES
- **[SMTP Example](examples/smtp-example.js)** - Using SMTP (Gmail, Outlook, etc.)

### Email Templates

- **[Professional Template](templates/email-template-professional.html)** - Clean professional email
- **[Newsletter Template](templates/email-template-newsletter.html)** - Newsletter with articles

## 🔧 Configuration Options

### New Advanced Features

- ✅ **Automatic Email Verification**
  - Regex format validation
  - MX record domain check
  - Optional SMTP connection verification
- ✅ **Queue Management**
  - Queue-based batch processing
  - Real-time status tracking via events and snapshots
  - Queue-level retry with exponential backoff
- ✅ **SMTP Sending Enhancements**
  - Rate limiting
  - Multiple SMTP support (round-robin with `SMTP_POOL_CONFIG`)
  - HTML + Plain text email support
- ✅ **Automation**
  - Scheduled sending (`scheduleEmail`)
  - Auto validation before queue/send
  - Auto cleanup of queue history
- ✅ **Reporting & Monitoring**
  - Real-time status (`getRealtimeStatus`)
  - Daily JSON reports in `logs/reports`
  - Structured error logging to `logs/error.log`

### Email Service Providers

#### SendGrid
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Your Company
```

#### Mailgun
```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=your_api_key
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FROM_EMAIL=noreply@yourdomain.com
MAILGUN_FROM_NAME=Your Company
```

#### AWS SES
```env
EMAIL_SERVICE=ses
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your_access_key
AWS_SES_SECRET_ACCESS_KEY=your_secret_key
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
AWS_SES_FROM_NAME=Your Company
```

#### SMTP (Generic)
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Your Company
```

### Rate Limiting & Performance

```env
EMAIL_RATE_LIMIT=10        # Emails per second
EMAIL_MAX_RETRIES=3        # Maximum retry attempts
EMAIL_RETRY_DELAY=1000     # Retry delay in milliseconds
EMAIL_BATCH_SIZE=50        # Batch size for bulk sending
```

### Queue, Validation, Automation & Reporting

```env
EMAIL_ENABLE_QUEUE=true
EMAIL_QUEUE_PROCESS_INTERVAL_MS=2000
EMAIL_QUEUE_MAX_RETRIES=3
EMAIL_QUEUE_RETRY_BASE_DELAY_MS=1000
EMAIL_QUEUE_CLEANUP_AFTER_DAYS=7

EMAIL_AUTO_VALIDATE=true
EMAIL_VALIDATE_REGEX=true
EMAIL_VALIDATE_MX=true
EMAIL_VALIDATE_SMTP=false

SMTP_POOL_CONFIG=[]

EMAIL_AUTOMATION_ENABLED=true
EMAIL_AUTO_PROCESS_QUEUE=true
EMAIL_AUTO_CLEANUP=true
EMAIL_CLEANUP_INTERVAL_MS=3600000
EMAIL_DAILY_REPORT_HOUR=0
EMAIL_DAILY_REPORT_MINUTE=5

EMAIL_REPORTING_ENABLED=true
EMAIL_REPORTS_DIR=logs/reports
EMAIL_ERROR_LOG_FILE=logs/error.log
```

### Tracking

```env
EMAIL_TRACK_OPENS=true     # Track email opens
EMAIL_TRACK_CLICKS=true    # Track link clicks
```

## 🛡️ Anti-Spam Best Practices

### 1. DNS Configuration (REQUIRED)
- ✅ Configure SPF record
- ✅ Set up DKIM authentication
- ✅ Implement DMARC policy
- ✅ Set up rDNS/PTR record (for SMTP)

### 2. Email Content
- ✅ Always include plain text version
- ✅ Avoid spam trigger words
- ✅ Maintain good text-to-image ratio (60:40)
- ✅ Use proper HTML structure
- ✅ Include unsubscribe link

### 3. List Management
- ✅ Implement double opt-in
- ✅ Easy unsubscribe mechanism
- ✅ Regular list cleaning
- ✅ Never buy email lists

### 4. Sending Patterns
- ✅ Gradual domain warm-up
- ✅ Consistent sending volume
- ✅ Rate limiting
- ✅ Monitor bounce and complaint rates

## 📊 Monitoring & Testing

### Test Your Configuration

```bash
# Send test email
node examples/send-single-email.js

# Test bulk sending
node examples/send-bulk-emails.js
```

### Tools for Testing

1. **[Mail-Tester](https://www.mail-tester.com/)** - Test spam score (target: 10/10)
2. **[MXToolbox](https://mxtoolbox.com/)** - Check DNS records and blacklists
3. **[Google Postmaster Tools](https://postmaster.google.com/)** - Monitor Gmail delivery
4. **[Microsoft SNDS](https://sendersupport.olc.protection.outlook.com/snds/)** - Monitor Outlook delivery

### Key Metrics to Monitor

- **Delivery Rate**: Target > 95%
- **Open Rate**: Benchmark ~20-25%
- **Bounce Rate**: Keep < 5%
- **Spam Complaint Rate**: Keep < 0.1%
- **Unsubscribe Rate**: Keep < 0.5%

## 🏗️ Project Structure

```
comanmanis/
├── config/
│   └── email.config.js          # Email configuration module
├── services/
│   └── EmailService.js          # Main email service
├── examples/
│   ├── send-single-email.js     # Single email example
│   ├── send-bulk-emails.js      # Bulk email example
│   ├── sendgrid-example.js      # SendGrid specific
│   ├── mailgun-example.js       # Mailgun specific
│   ├── aws-ses-example.js       # AWS SES specific
│   └── smtp-example.js          # SMTP specific
├── templates/
│   ├── email-template-professional.html
│   └── email-template-newsletter.html
├── docs/
│   └── ANTI_SPAM_CONFIGURATION.md
├── .env.example                 # Environment template
├── package.json
└── README.md
```

## 🔍 API Reference

### EmailService

#### Constructor
```javascript
const emailService = new EmailService();
```

#### Methods

**sendEmail(message, retries)**
- Send a single email with retry logic
- Parameters:
  - `message`: Email message object
  - `retries`: Number of retries (optional)
- Returns: `{ success: boolean, result?: any, error?: string }`

**sendBulkEmails(messages)**
- Send multiple emails with rate limiting and batching
- Parameters:
  - `messages`: Array of email message objects
- Returns: Array of results

**verifyConfiguration()**
- Verify email configuration
- Returns: `{ valid: boolean, service?: string, errors?: string[] }`

### Message Object

```javascript
{
  to: 'recipient@example.com',        // Required
  subject: 'Email Subject',            // Required
  html: '<h1>HTML Content</h1>',      // Required
  text: 'Plain text content',          // Optional (auto-generated if not provided)
  from: {                              // Optional (uses config default)
    email: 'sender@example.com',
    name: 'Sender Name'
  },
  replyTo: 'reply@example.com',       // Optional
  headers: {                           // Optional custom headers
    'X-Custom': 'value'
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Troubleshooting

### Emails going to spam?
1. Check SPF/DKIM/DMARC configuration
2. Test with mail-tester.com
3. Review content for spam triggers
4. Check domain reputation
5. Verify not on blacklist

### High bounce rate?
1. Validate email addresses before sending
2. Implement double opt-in
3. Clean inactive subscribers
4. Monitor hard vs soft bounces

### Provider authentication errors?
1. Verify API keys/credentials
2. Check sender email is verified
3. Ensure correct region (AWS SES)
4. Check account limits and quotas

## 📞 Support

For issues and questions:
- Check [Documentation](docs/ANTI_SPAM_CONFIGURATION.md)
- Review [Examples](examples/)
- Check provider documentation:
  - [SendGrid Docs](https://docs.sendgrid.com/)
  - [Mailgun Docs](https://documentation.mailgun.com/)
  - [AWS SES Docs](https://docs.aws.amazon.com/ses/)
  - [Nodemailer Docs](https://nodemailer.com/)

---

**Made with ❤️ for reliable email delivery**