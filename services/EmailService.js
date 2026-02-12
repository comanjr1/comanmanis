/**
 * Email Service Module
 * Comprehensive email sending service with spam prevention best practices
 */

const emailConfig = require('../config/email.config');

class EmailService {
  constructor() {
    this.config = emailConfig;
    this.provider = null;
    this.initializeProvider();
  }

  /**
   * Initialize email provider based on configuration
   */
  initializeProvider() {
    const errors = this.config.validate();
    if (errors.length > 0) {
      console.error('Email configuration errors:', errors);
      throw new Error(`Email configuration invalid: ${errors.join(', ')}`);
    }

    switch(this.config.service) {
      case 'sendgrid':
        this.provider = this.createSendGridProvider();
        break;
      case 'mailgun':
        this.provider = this.createMailgunProvider();
        break;
      case 'ses':
        this.provider = this.createSESProvider();
        break;
      case 'smtp':
        this.provider = this.createSMTPProvider();
        break;
      default:
        throw new Error(`Unsupported email service: ${this.config.service}`);
    }
  }

  /**
   * Create SendGrid provider
   */
  createSendGridProvider() {
    // Note: Requires @sendgrid/mail package
    // npm install @sendgrid/mail
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(this.config.sendgrid.apiKey);
      return {
        type: 'sendgrid',
        client: sgMail,
        send: async (message) => {
          const msg = this.prepareSendGridMessage(message);
          return await sgMail.send(msg);
        }
      };
    } catch (error) {
      console.warn('SendGrid package not installed. Run: npm install @sendgrid/mail');
      throw error;
    }
  }

  /**
   * Create Mailgun provider
   */
  createMailgunProvider() {
    // Note: Requires mailgun.js package
    // npm install mailgun.js form-data
    try {
      const formData = require('form-data');
      const Mailgun = require('mailgun.js');
      const mailgun = new Mailgun(formData);
      const client = mailgun.client({
        username: 'api',
        key: this.config.mailgun.apiKey
      });
      
      return {
        type: 'mailgun',
        client: client,
        send: async (message) => {
          const msg = this.prepareMailgunMessage(message);
          return await client.messages.create(this.config.mailgun.domain, msg);
        }
      };
    } catch (error) {
      console.warn('Mailgun package not installed. Run: npm install mailgun.js form-data');
      throw error;
    }
  }

  /**
   * Create AWS SES provider
   */
  createSESProvider() {
    // Note: Requires @aws-sdk/client-ses package
    // npm install @aws-sdk/client-ses
    try {
      const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
      const client = new SESClient({
        region: this.config.ses.region,
        credentials: {
          accessKeyId: this.config.ses.accessKeyId,
          secretAccessKey: this.config.ses.secretAccessKey
        }
      });
      
      return {
        type: 'ses',
        client: client,
        send: async (message) => {
          const command = this.prepareSESMessage(message);
          return await client.send(command);
        }
      };
    } catch (error) {
      console.warn('AWS SES package not installed. Run: npm install @aws-sdk/client-ses');
      throw error;
    }
  }

  /**
   * Create SMTP provider
   */
  createSMTPProvider() {
    // Note: Requires nodemailer package
    // npm install nodemailer
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: this.config.smtp.host,
        port: this.config.smtp.port,
        secure: this.config.smtp.secure,
        auth: this.config.smtp.auth
      });
      
      return {
        type: 'smtp',
        client: transporter,
        send: async (message) => {
          const msg = this.prepareSMTPMessage(message);
          return await transporter.sendMail(msg);
        }
      };
    } catch (error) {
      console.warn('Nodemailer package not installed. Run: npm install nodemailer');
      throw error;
    }
  }

  /**
   * Prepare SendGrid message with best practices
   */
  prepareSendGridMessage(message) {
    const from = message.from || this.config.sendgrid.from;
    const msg = {
      to: message.to,
      from: {
        email: from.email,
        name: from.name
      },
      subject: message.subject,
      html: message.html,
      trackingSettings: {
        clickTracking: { enable: this.config.tracking.clicks },
        openTracking: { enable: this.config.tracking.opens }
      },
      headers: this.getAntiSpamHeaders(message)
    };

    // Add plain text version
    if (message.text || this.config.defaults.includePlainText) {
      msg.text = message.text || this.htmlToText(message.html);
    }

    // Add reply-to
    if (message.replyTo || this.config.replyTo) {
      msg.replyTo = message.replyTo || this.config.replyTo;
    }

    // Add unsubscribe
    if (this.config.defaults.includeUnsubscribeHeader && this.config.unsubscribeUrl) {
      msg.headers['List-Unsubscribe'] = `<${this.config.unsubscribeUrl}>`;
    }

    return msg;
  }

  /**
   * Prepare Mailgun message with best practices
   */
  prepareMailgunMessage(message) {
    const from = message.from || this.config.mailgun.from;
    const msg = {
      to: Array.isArray(message.to) ? message.to : [message.to],
      from: `${from.name} <${from.email}>`,
      subject: message.subject,
      html: message.html,
      'o:tracking': this.config.tracking.opens,
      'o:tracking-clicks': this.config.tracking.clicks
    };

    // Add plain text version
    if (message.text || this.config.defaults.includePlainText) {
      msg.text = message.text || this.htmlToText(message.html);
    }

    // Add reply-to
    if (message.replyTo || this.config.replyTo) {
      msg['h:Reply-To'] = message.replyTo || this.config.replyTo;
    }

    // Add unsubscribe
    if (this.config.defaults.includeUnsubscribeHeader && this.config.unsubscribeUrl) {
      msg['h:List-Unsubscribe'] = `<${this.config.unsubscribeUrl}>`;
    }

    // Add anti-spam headers
    const headers = this.getAntiSpamHeaders(message);
    Object.keys(headers).forEach(key => {
      msg[`h:${key}`] = headers[key];
    });

    return msg;
  }

  /**
   * Prepare AWS SES message with best practices
   */
  prepareSESMessage(message) {
    const { SendEmailCommand } = require('@aws-sdk/client-ses');
    const from = message.from || this.config.ses.from;
    
    const params = {
      Source: `${from.name} <${from.email}>`,
      Destination: {
        ToAddresses: Array.isArray(message.to) ? message.to : [message.to]
      },
      Message: {
        Subject: {
          Data: message.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: message.html,
            Charset: 'UTF-8'
          }
        }
      }
    };

    // Add plain text version
    if (message.text || this.config.defaults.includePlainText) {
      params.Message.Body.Text = {
        Data: message.text || this.htmlToText(message.html),
        Charset: 'UTF-8'
      };
    }

    // Add reply-to
    if (message.replyTo || this.config.replyTo) {
      params.ReplyToAddresses = [message.replyTo || this.config.replyTo];
    }

    return new SendEmailCommand(params);
  }

  /**
   * Prepare SMTP message with best practices
   */
  prepareSMTPMessage(message) {
    const from = message.from || this.config.smtp.from;
    const msg = {
      from: `${from.name} <${from.email}>`,
      to: message.to,
      subject: message.subject,
      html: message.html,
      headers: this.getAntiSpamHeaders(message)
    };

    // Add plain text version
    if (message.text || this.config.defaults.includePlainText) {
      msg.text = message.text || this.htmlToText(message.html);
    }

    // Add reply-to
    if (message.replyTo || this.config.replyTo) {
      msg.replyTo = message.replyTo || this.config.replyTo;
    }

    // Add unsubscribe
    if (this.config.defaults.includeUnsubscribeHeader && this.config.unsubscribeUrl) {
      msg.headers['List-Unsubscribe'] = `<${this.config.unsubscribeUrl}>`;
    }

    return msg;
  }

  /**
   * Get anti-spam headers
   */
  getAntiSpamHeaders(message) {
    const headers = {
      'X-Mailer': 'Comanmanis Email Service',
      'X-Priority': '3',
      'Importance': 'Normal'
    };

    // Add custom headers from message
    if (message.headers) {
      Object.assign(headers, message.headers);
    }

    return headers;
  }

  /**
   * Convert HTML to plain text (basic implementation)
   */
  htmlToText(html) {
    return html
      .replace(/<style[^>]*>.*<\/style>/gm, '')
      .replace(/<script[^>]*>.*<\/script>/gm, '')
      .replace(/<[^>]+>/gm, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Send a single email with retry logic
   */
  async sendEmail(message, retries = 0) {
    try {
      const result = await this.provider.send(message);
      console.log(`Email sent successfully to ${message.to}`);
      return { success: true, result };
    } catch (error) {
      console.error(`Error sending email to ${message.to}:`, error.message);
      
      if (retries < this.config.maxRetries) {
        console.log(`Retrying... (${retries + 1}/${this.config.maxRetries})`);
        await this.delay(this.config.retryDelay * (retries + 1));
        return this.sendEmail(message, retries + 1);
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Send bulk emails with rate limiting and batching
   */
  async sendBulkEmails(messages) {
    const results = [];
    const batches = this.createBatches(messages, this.config.batchSize);
    
    console.log(`Sending ${messages.length} emails in ${batches.length} batches`);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} emails)`);
      
      const batchResults = await this.sendBatch(batch);
      results.push(...batchResults);
      
      // Rate limiting between batches
      if (i < batches.length - 1) {
        const delay = (1000 / this.config.rateLimit) * batch.length;
        await this.delay(delay);
      }
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    console.log(`Bulk sending complete: ${successful} successful, ${failed} failed`);
    
    return results;
  }

  /**
   * Send a batch of emails
   */
  async sendBatch(batch) {
    const promises = batch.map(message => this.sendEmail(message));
    return await Promise.all(promises);
  }

  /**
   * Create batches from array
   */
  createBatches(array, batchSize) {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verify email configuration
   */
  async verifyConfiguration() {
    console.log('Verifying email configuration...');
    const errors = this.config.validate();
    
    if (errors.length > 0) {
      console.error('Configuration errors:', errors);
      return { valid: false, errors };
    }
    
    console.log('✓ Configuration is valid');
    console.log(`✓ Using ${this.config.service} as email provider`);
    
    return { valid: true, service: this.config.service };
  }
}

module.exports = EmailService;
