/**
 * Email Configuration Module
 * Centralized email configuration for reliable mass email sending
 */

require('dotenv').config();

const emailConfig = {
  // Service provider configuration
  service: process.env.EMAIL_SERVICE || 'smtp',
  
  // SendGrid configuration
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: process.env.SENDGRID_FROM_NAME
    }
  },
  
  // Mailgun configuration
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    from: {
      email: process.env.MAILGUN_FROM_EMAIL,
      name: process.env.MAILGUN_FROM_NAME
    }
  },
  
  // AWS SES configuration
  ses: {
    region: process.env.AWS_SES_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
    from: {
      email: process.env.AWS_SES_FROM_EMAIL,
      name: process.env.AWS_SES_FROM_NAME
    }
  },
  
  // SMTP configuration
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    from: {
      email: process.env.SMTP_FROM_EMAIL,
      name: process.env.SMTP_FROM_NAME
    }
  },
  
  // Rate limiting and retry configuration
  rateLimit: parseInt(process.env.EMAIL_RATE_LIMIT) || 10,
  maxRetries: parseInt(process.env.EMAIL_MAX_RETRIES) || 3,
  retryDelay: parseInt(process.env.EMAIL_RETRY_DELAY) || 1000,
  batchSize: parseInt(process.env.EMAIL_BATCH_SIZE) || 50,
  
  // Tracking configuration
  tracking: {
    opens: process.env.EMAIL_TRACK_OPENS === 'true',
    clicks: process.env.EMAIL_TRACK_CLICKS === 'true'
  },
  
  // Reply-to configuration
  replyTo: process.env.EMAIL_REPLY_TO,
  
  // Unsubscribe configuration
  unsubscribeUrl: process.env.EMAIL_UNSUBSCRIBE_URL,
  
  // Best practices configuration
  defaults: {
    // Use plain text alternative
    includePlainText: true,
    // Add list-unsubscribe header
    includeUnsubscribeHeader: true,
    // Add authentication headers
    includeAuthHeaders: true,
    // Use proper content type
    contentType: 'text/html; charset=UTF-8',
    // Priority
    priority: 'normal'
  }
};

// Validation function
emailConfig.validate = function() {
  const errors = [];
  
  if (!this.service) {
    errors.push('EMAIL_SERVICE is not configured');
  }
  
  const serviceConfig = this[this.service];
  if (!serviceConfig) {
    errors.push(`Configuration for service '${this.service}' not found`);
    return errors;
  }
  
  // Validate based on service
  switch(this.service) {
    case 'sendgrid':
      if (!serviceConfig.apiKey) errors.push('SENDGRID_API_KEY is required');
      if (!serviceConfig.from.email) errors.push('SENDGRID_FROM_EMAIL is required');
      break;
    case 'mailgun':
      if (!serviceConfig.apiKey) errors.push('MAILGUN_API_KEY is required');
      if (!serviceConfig.domain) errors.push('MAILGUN_DOMAIN is required');
      if (!serviceConfig.from.email) errors.push('MAILGUN_FROM_EMAIL is required');
      break;
    case 'ses':
      if (!serviceConfig.accessKeyId) errors.push('AWS_SES_ACCESS_KEY_ID is required');
      if (!serviceConfig.secretAccessKey) errors.push('AWS_SES_SECRET_ACCESS_KEY is required');
      if (!serviceConfig.from.email) errors.push('AWS_SES_FROM_EMAIL is required');
      break;
    case 'smtp':
      if (!serviceConfig.host) errors.push('SMTP_HOST is required');
      if (!serviceConfig.auth.user) errors.push('SMTP_USER is required');
      if (!serviceConfig.auth.pass) errors.push('SMTP_PASSWORD is required');
      if (!serviceConfig.from.email) errors.push('SMTP_FROM_EMAIL is required');
      break;
  }
  
  return errors;
};

module.exports = emailConfig;
