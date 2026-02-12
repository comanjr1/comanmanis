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
  
  // Multiple SMTP provider support (JSON array)
  // Example: [{"host":"smtp1.example.com","port":587,"secure":false,"user":"u1","pass":"p1"}]
  smtpPool: (() => {
    try {
      if (!process.env.SMTP_POOL_CONFIG) return [];
      const parsed = JSON.parse(process.env.SMTP_POOL_CONFIG);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Invalid SMTP_POOL_CONFIG JSON. Falling back to empty pool.');
      return [];
    }
  })(),
  
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
  
  // Email verification configuration
  verification: {
    autoValidate: process.env.EMAIL_AUTO_VALIDATE !== 'false',
    regexValidation: process.env.EMAIL_VALIDATE_REGEX !== 'false',
    checkMxRecord: process.env.EMAIL_VALIDATE_MX !== 'false',
    smtpVerification: process.env.EMAIL_VALIDATE_SMTP === 'true'
  },
  
  // Queue management configuration
  queue: {
    enabled: process.env.EMAIL_ENABLE_QUEUE !== 'false',
    processIntervalMs: parseInt(process.env.EMAIL_QUEUE_PROCESS_INTERVAL_MS) || 2000,
    maxRetries: parseInt(process.env.EMAIL_QUEUE_MAX_RETRIES) || 3,
    retryBaseDelayMs: parseInt(process.env.EMAIL_QUEUE_RETRY_BASE_DELAY_MS) || 1000,
    cleanupAfterDays: parseInt(process.env.EMAIL_QUEUE_CLEANUP_AFTER_DAYS) || 7
  },
  
  // Automation configuration
  automation: {
    enabled: process.env.EMAIL_AUTOMATION_ENABLED !== 'false',
    autoProcessQueue: process.env.EMAIL_AUTO_PROCESS_QUEUE !== 'false',
    autoCleanup: process.env.EMAIL_AUTO_CLEANUP !== 'false',
    cleanupIntervalMs: parseInt(process.env.EMAIL_CLEANUP_INTERVAL_MS) || 3600000,
    dailyReportHour: parseInt(process.env.EMAIL_DAILY_REPORT_HOUR) || 0,
    dailyReportMinute: parseInt(process.env.EMAIL_DAILY_REPORT_MINUTE) || 5
  },
  
  // Reporting and monitoring configuration
  reporting: {
    enabled: process.env.EMAIL_REPORTING_ENABLED !== 'false',
    reportsDir: process.env.EMAIL_REPORTS_DIR || 'logs/reports',
    errorLogFile: process.env.EMAIL_ERROR_LOG_FILE || 'logs/error.log'
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
