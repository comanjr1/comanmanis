/**
 * Email Service Module
 * Comprehensive email sending service with spam prevention best practices
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const { promises: dns } = require('dns');
const { randomUUID } = require('crypto');
const emailConfig = require('../config/email.config');

class EmailService {
  constructor() {
    this.config = emailConfig;
    this.provider = null;
    this.smtpProviders = [];
    this.smtpProviderIndex = 0;
    this.statusEmitter = new EventEmitter();
    this.queue = [];
    this.queueHistory = [];
    this.isProcessingQueue = false;
    this.automationTimers = [];
    this.metrics = {
      queued: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      retried: 0,
      validated: 0,
      invalid: 0,
      lastError: null,
      lastSentAt: null,
      lastReportAt: null
    };

    this.ensureReportingPaths();
    this.initializeProvider();
    this.startAutomation();
  }

  ensureReportingPaths() {
    if (!this.config.reporting || !this.config.reporting.enabled) return;

    try {
      fs.mkdirSync(this.config.reporting.reportsDir, { recursive: true });
      fs.mkdirSync(path.dirname(this.config.reporting.errorLogFile), { recursive: true });
    } catch (error) {
      console.warn('Unable to create reporting directories:', error.message);
    }
  }

  emitStatus(event, payload = {}) {
    this.statusEmitter.emit('status', {
      event,
      payload,
      timestamp: new Date().toISOString(),
      snapshot: this.getRealtimeStatus()
    });
  }

  onStatusChange(handler) {
    this.statusEmitter.on('status', handler);
    return () => this.statusEmitter.off('status', handler);
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
        this.smtpProviders = this.createSMTPProviders();
        this.provider = {
          type: 'smtp-pool',
          send: async (message) => {
            const smtpProvider = this.getNextSMTPProvider();
            return smtpProvider.send(message);
          }
        };
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
  createSMTPProvider(smtpConfig = this.config.smtp, label = 'primary') {
    // Note: Requires nodemailer package
    // npm install nodemailer
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: smtpConfig.auth
      });
      
      return {
        type: 'smtp',
        label,
        client: transporter,
        send: async (message) => {
          const msg = this.prepareSMTPMessage(message, smtpConfig);
          return await transporter.sendMail(msg);
        }
      };
    } catch (error) {
      console.warn('Nodemailer package not installed. Run: npm install nodemailer');
      throw error;
    }
  }

  createSMTPProviders() {
    const providers = [this.createSMTPProvider(this.config.smtp, 'primary')];

    if (Array.isArray(this.config.smtpPool)) {
      this.config.smtpPool.forEach((poolConfig, index) => {
        if (!poolConfig || !poolConfig.host || !poolConfig.user || !poolConfig.pass) {
          return;
        }

        const smtpConfig = {
          host: poolConfig.host,
          port: parseInt(poolConfig.port) || 587,
          secure: poolConfig.secure === true || poolConfig.secure === 'true',
          auth: {
            user: poolConfig.user,
            pass: poolConfig.pass
          },
          from: {
            email: poolConfig.fromEmail || this.config.smtp.from.email,
            name: poolConfig.fromName || this.config.smtp.from.name
          }
        };

        providers.push(this.createSMTPProvider(smtpConfig, `pool-${index + 1}`));
      });
    }

    return providers;
  }

  getNextSMTPProvider() {
    if (!this.smtpProviders.length) {
      throw new Error('No SMTP provider available');
    }

    const provider = this.smtpProviders[this.smtpProviderIndex % this.smtpProviders.length];
    this.smtpProviderIndex = (this.smtpProviderIndex + 1) % this.smtpProviders.length;
    return provider;
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
  prepareSMTPMessage(message, smtpConfig = this.config.smtp) {
    const from = message.from || smtpConfig.from;
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
   * Convert HTML to plain text for email alternative version
   * 
   * SECURITY NOTE: This function is used ONLY to generate plain text email bodies
   * from HTML email content. The output is sent as plain text in emails, NOT rendered
   * as HTML in a browser context. Therefore, XSS concerns do not apply here.
   * 
   * For production use with complex HTML or user-generated content, consider using
   * a dedicated library like 'html-to-text' or 'cheerio' for better results.
   */
  htmlToText(html) {
    if (!html) return '';
    
    // Strip all HTML tags - output is plain text only, never rendered as HTML
    let text = html.replace(/<[^>]*>/g, '');
    
    // Decode common HTML entities for readability in plain text
    const entities = [
      ['&nbsp;', ' '],
      ['&quot;', '"'],
      ['&#39;', "'"],
      ['&#x27;', "'"],
      ['&lt;', '<'],
      ['&gt;', '>'],
      ['&amp;', '&']  // Must be last to avoid double-unescaping
    ];
    
    entities.forEach(([entity, char]) => {
      text = text.split(entity).join(char);
    });
    
    // Clean up whitespace
    return text.replace(/\s+/g, ' ').trim();
  }

  extractRecipientAddresses(to) {
    if (!to) return [];
    if (Array.isArray(to)) return to.map(email => this.extractEmailAddress(email)).filter(Boolean);

    return String(to)
      .split(',')
      .map(email => this.extractEmailAddress(email))
      .filter(Boolean);
  }

  extractEmailAddress(value) {
    if (!value) return null;
    const input = String(value).trim();
    const match = input.match(/<([^>]+)>/);
    return match ? match[1].trim() : input;
  }

  validateEmailFormat(email) {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return emailRegex.test(email);
  }

  async checkMxRecord(email) {
    const domain = email.split('@')[1];
    if (!domain) {
      return { valid: false, error: 'Invalid email domain' };
    }

    try {
      const mxRecords = await dns.resolveMx(domain);
      return { valid: Array.isArray(mxRecords) && mxRecords.length > 0, records: mxRecords };
    } catch (error) {
      return { valid: false, error: `MX lookup failed: ${error.message}` };
    }
  }

  async verifySmtpConnection() {
    if (this.config.service !== 'smtp') {
      return { valid: true, skipped: true, reason: 'SMTP verification only applies to SMTP service' };
    }

    const provider = this.smtpProviders[0];
    if (!provider || !provider.client || typeof provider.client.verify !== 'function') {
      return { valid: false, error: 'SMTP verify method unavailable' };
    }

    try {
      await provider.client.verify();
      return { valid: true };
    } catch (error) {
      return { valid: false, error: `SMTP verification failed: ${error.message}` };
    }
  }

  async verifyEmail(email, options = {}) {
    const smtpCheck = options.smtpCheck === true || (options.smtpCheck !== false && this.config.verification.smtpVerification);
    const result = {
      email,
      valid: true,
      checks: {
        format: true,
        mx: true,
        smtp: true
      },
      errors: []
    };

    if (this.config.verification.regexValidation) {
      result.checks.format = this.validateEmailFormat(email);
      if (!result.checks.format) {
        result.valid = false;
        result.errors.push('Invalid email format');
      }
    }

    if (result.valid && this.config.verification.checkMxRecord) {
      const mxCheck = await this.checkMxRecord(email);
      result.checks.mx = mxCheck.valid;
      if (!mxCheck.valid) {
        result.valid = false;
        result.errors.push(mxCheck.error || 'MX record not found');
      }
    }

    if (result.valid && smtpCheck) {
      const smtpResult = await this.verifySmtpConnection();
      result.checks.smtp = smtpResult.valid;
      if (!smtpResult.valid) {
        result.valid = false;
        result.errors.push(smtpResult.error || 'SMTP verification failed');
      }
    }

    if (result.valid) {
      this.metrics.validated += 1;
    } else {
      this.metrics.invalid += 1;
    }

    return result;
  }

  async autoValidateMessage(message) {
    if (!this.config.verification.autoValidate) {
      return { valid: true, results: [] };
    }

    const recipients = this.extractRecipientAddresses(message.to);
    if (!recipients.length) {
      return { valid: false, results: [], errors: ['No recipient email provided'] };
    }

    const results = await Promise.all(recipients.map(email => this.verifyEmail(email)));
    const invalid = results.filter(entry => !entry.valid);

    return {
      valid: invalid.length === 0,
      results,
      errors: invalid.map(entry => `${entry.email}: ${entry.errors.join('; ')}`)
    };
  }

  createQueueItem(message, options = {}) {
    const scheduledAt = options.scheduledAt ? new Date(options.scheduledAt) : new Date();
    const now = new Date();

    return {
      id: randomUUID(),
      message,
      status: scheduledAt > now ? 'scheduled' : 'pending',
      attempts: 0,
      maxRetries: options.maxRetries || this.config.queue.maxRetries,
      createdAt: now,
      updatedAt: now,
      scheduledAt,
      lastError: null,
      result: null
    };
  }

  async enqueueEmail(message, options = {}) {
    const validation = await this.autoValidateMessage(message);
    if (!validation.valid) {
      const invalidEntry = {
        id: randomUUID(),
        message,
        status: 'invalid',
        attempts: 0,
        maxRetries: options.maxRetries || this.config.queue.maxRetries,
        createdAt: new Date(),
        updatedAt: new Date(),
        scheduledAt: new Date(),
        lastError: validation.errors.join(', '),
        result: { success: false, error: 'Validation failed' }
      };
      this.queueHistory.push(invalidEntry);
      this.emitStatus('queue-invalid', { id: invalidEntry.id, error: invalidEntry.lastError });
      return { queued: false, id: invalidEntry.id, validation };
    }

    const queueItem = this.createQueueItem(message, options);
    this.queue.push(queueItem);
    this.metrics.queued += 1;
    this.emitStatus('queue-added', { id: queueItem.id, status: queueItem.status, scheduledAt: queueItem.scheduledAt });

    return {
      queued: true,
      id: queueItem.id,
      status: queueItem.status,
      scheduledAt: queueItem.scheduledAt.toISOString()
    };
  }

  async enqueueBulkEmails(messages, options = {}) {
    const results = [];
    for (const message of messages) {
      const enqueueResult = await this.enqueueEmail(message, options);
      results.push(enqueueResult);
    }
    return results;
  }

  getDueQueueItems(limit = this.config.batchSize) {
    const now = Date.now();
    return this.queue
      .filter(item => (item.status === 'pending' || item.status === 'scheduled') && item.scheduledAt.getTime() <= now)
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
      .slice(0, limit);
  }

  async processQueue() {
    if (!this.config.queue.enabled) {
      return [];
    }

    if (this.isProcessingQueue) {
      return [];
    }

    this.isProcessingQueue = true;
    const dueItems = this.getDueQueueItems();

    if (!dueItems.length) {
      this.isProcessingQueue = false;
      return [];
    }

    this.metrics.processing += dueItems.length;
    this.emitStatus('queue-processing-start', { count: dueItems.length });

    try {
      const results = await Promise.all(dueItems.map(item => this.processQueueItem(item)));
      this.emitStatus('queue-processing-complete', { processed: results.length });
      return results;
    } finally {
      this.metrics.processing = Math.max(0, this.metrics.processing - dueItems.length);
      this.isProcessingQueue = false;
    }
  }

  async processQueueItem(item) {
    item.status = 'processing';
    item.attempts += 1;
    item.updatedAt = new Date();

    const sendResult = await this.sendEmail(item.message, 0, {
      disableRetry: true,
      skipValidation: true
    });

    if (sendResult.success) {
      item.status = 'sent';
      item.result = sendResult.result;
      item.updatedAt = new Date();
      this.metrics.sent += 1;
      this.metrics.lastSentAt = item.updatedAt.toISOString();
      this.removeFromQueue(item.id);
      this.queueHistory.push(item);
      this.emitStatus('queue-sent', { id: item.id, to: item.message.to });
      return { id: item.id, success: true, status: item.status };
    }

    item.lastError = sendResult.error;
    item.updatedAt = new Date();

    if (item.attempts <= item.maxRetries) {
      const delayMs = this.config.queue.retryBaseDelayMs * Math.pow(2, item.attempts - 1);
      item.status = 'scheduled';
      item.scheduledAt = new Date(Date.now() + delayMs);
      this.metrics.retried += 1;
      this.emitStatus('queue-retry-scheduled', {
        id: item.id,
        attempts: item.attempts,
        nextRunAt: item.scheduledAt.toISOString(),
        error: item.lastError
      });
      return { id: item.id, success: false, status: item.status, retryInMs: delayMs, error: item.lastError };
    }

    item.status = 'failed';
    this.metrics.failed += 1;
    this.removeFromQueue(item.id);
    this.queueHistory.push(item);
    this.logError(new Error(item.lastError || 'Queue item failed'), {
      type: 'queue-item-failed',
      itemId: item.id,
      recipient: item.message.to,
      attempts: item.attempts
    });
    this.emitStatus('queue-failed', { id: item.id, error: item.lastError });

    return { id: item.id, success: false, status: item.status, error: item.lastError };
  }

  removeFromQueue(itemId) {
    const index = this.queue.findIndex(item => item.id === itemId);
    if (index >= 0) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  async scheduleEmail(message, scheduledAt, options = {}) {
    return this.enqueueEmail(message, {
      ...options,
      scheduledAt
    });
  }

  cleanupQueueHistory() {
    const keepDays = this.config.queue.cleanupAfterDays;
    const cutoff = Date.now() - (keepDays * 24 * 60 * 60 * 1000);
    const originalLength = this.queueHistory.length;

    this.queueHistory = this.queueHistory.filter(item => {
      const updatedTime = new Date(item.updatedAt || item.createdAt).getTime();
      return updatedTime >= cutoff;
    });

    const removed = originalLength - this.queueHistory.length;
    if (removed > 0) {
      this.emitStatus('queue-cleanup', { removed, remaining: this.queueHistory.length });
    }

    return { removed, remaining: this.queueHistory.length };
  }

  startAutomation() {
    if (!this.config.automation.enabled) {
      return;
    }

    if (this.config.queue.enabled && this.config.automation.autoProcessQueue) {
      const queueTimer = setInterval(() => {
        this.processQueue().catch(error => {
          this.logError(error, { type: 'queue-processing-interval' });
        });
      }, this.config.queue.processIntervalMs);
      this.automationTimers.push(queueTimer);
    }

    if (this.config.automation.autoCleanup) {
      const cleanupTimer = setInterval(() => {
        this.cleanupQueueHistory();
      }, this.config.automation.cleanupIntervalMs);
      this.automationTimers.push(cleanupTimer);
    }

    if (this.config.reporting.enabled) {
      const reportTimer = setInterval(() => {
        this.generateDailyReportIfDue();
      }, 60 * 1000);
      this.automationTimers.push(reportTimer);
    }
  }

  stopAutomation() {
    this.automationTimers.forEach(timer => clearInterval(timer));
    this.automationTimers = [];
  }

  generateDailyReportIfDue(now = new Date()) {
    const hour = now.getHours();
    const minute = now.getMinutes();

    if (hour !== this.config.automation.dailyReportHour || minute !== this.config.automation.dailyReportMinute) {
      return null;
    }

    const today = now.toISOString().slice(0, 10);
    if (this.metrics.lastReportAt && this.metrics.lastReportAt.slice(0, 10) === today) {
      return null;
    }

    return this.generateDailyReport(now);
  }

  generateDailyReport(date = new Date()) {
    const day = date.toISOString().slice(0, 10);
    const start = new Date(`${day}T00:00:00.000Z`);
    const end = new Date(`${day}T23:59:59.999Z`);

    const entries = this.queueHistory.filter(item => {
      const ts = new Date(item.updatedAt || item.createdAt).getTime();
      return ts >= start.getTime() && ts <= end.getTime();
    });

    const totals = {
      total: entries.length,
      sent: entries.filter(item => item.status === 'sent').length,
      failed: entries.filter(item => item.status === 'failed').length,
      invalid: entries.filter(item => item.status === 'invalid').length
    };

    const report = {
      date: day,
      generatedAt: new Date().toISOString(),
      totals,
      metrics: { ...this.metrics },
      queue: {
        active: this.queue.length,
        history: this.queueHistory.length
      }
    };

    if (this.config.reporting.enabled) {
      const reportPath = path.join(this.config.reporting.reportsDir, `daily-report-${day}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    }

    this.metrics.lastReportAt = new Date().toISOString();
    this.emitStatus('report-generated', { date: day, totals });
    return report;
  }

  logError(error, context = {}) {
    const message = error instanceof Error ? error.message : String(error);
    this.metrics.lastError = message;

    const entry = {
      timestamp: new Date().toISOString(),
      message,
      context
    };

    if (this.config.reporting.enabled) {
      try {
        fs.appendFileSync(this.config.reporting.errorLogFile, `${JSON.stringify(entry)}\n`);
      } catch (writeError) {
        console.error('Failed to write error log:', writeError.message);
      }
    }
  }

  getRealtimeStatus() {
    const activeQueueStatus = {
      pending: this.queue.filter(item => item.status === 'pending').length,
      scheduled: this.queue.filter(item => item.status === 'scheduled').length,
      processing: this.queue.filter(item => item.status === 'processing').length
    };

    return {
      service: this.config.service,
      rateLimit: this.config.rateLimit,
      batchSize: this.config.batchSize,
      queueEnabled: this.config.queue.enabled,
      queue: {
        active: this.queue.length,
        history: this.queueHistory.length,
        status: activeQueueStatus,
        isProcessing: this.isProcessingQueue
      },
      metrics: { ...this.metrics },
      smtp: {
        activeProviders: this.smtpProviders.length || (this.config.service === 'smtp' ? 1 : 0)
      },
      timestamp: new Date().toISOString()
    };
  }

  getQueueItemStatus(itemId) {
    const activeItem = this.queue.find(item => item.id === itemId);
    if (activeItem) {
      return {
        id: activeItem.id,
        status: activeItem.status,
        attempts: activeItem.attempts,
        maxRetries: activeItem.maxRetries,
        lastError: activeItem.lastError,
        scheduledAt: activeItem.scheduledAt
      };
    }

    const historyItem = this.queueHistory.find(item => item.id === itemId);
    if (historyItem) {
      return {
        id: historyItem.id,
        status: historyItem.status,
        attempts: historyItem.attempts,
        maxRetries: historyItem.maxRetries,
        lastError: historyItem.lastError,
        scheduledAt: historyItem.scheduledAt
      };
    }

    return null;
  }

  /**
   * Send a single email with retry logic
   */
  async sendEmail(message, retries = 0, options = {}) {
    const sendOptions = {
      disableRetry: false,
      skipValidation: false,
      ...options
    };

    try {
      if (!sendOptions.skipValidation) {
        const validation = await this.autoValidateMessage(message);
        if (!validation.valid) {
          return {
            success: false,
            error: `Email validation failed: ${validation.errors.join(', ')}`,
            validation
          };
        }
      }

      const result = await this.provider.send(message);
      console.log(`Email sent successfully to ${message.to}`);
      this.metrics.lastSentAt = new Date().toISOString();
      return { success: true, result };
    } catch (error) {
      console.error(`Error sending email to ${message.to}:`, error.message);
      
      if (!sendOptions.disableRetry && retries < this.config.maxRetries) {
        console.log(`Retrying... (${retries + 1}/${this.config.maxRetries})`);
        await this.delay(this.config.retryDelay * (retries + 1));
        this.metrics.retried += 1;
        return this.sendEmail(message, retries + 1, sendOptions);
      }

      this.metrics.failed += 1;
      this.logError(error, {
        type: 'send-email-failed',
        recipient: message.to,
        retries
      });
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Send bulk emails with rate limiting and batching
   */
  async sendBulkEmails(messages, options = {}) {
    if (options.useQueue) {
      return this.enqueueBulkEmails(messages, options);
    }

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

    if (this.config.service === 'smtp') {
      console.log(`✓ SMTP providers active: ${this.smtpProviders.length}`);
    }

    console.log(`✓ Queue enabled: ${this.config.queue.enabled}`);
    console.log(`✓ Auto validation: ${this.config.verification.autoValidate}`);
    console.log(`✓ Reporting enabled: ${this.config.reporting.enabled}`);
    
    return {
      valid: true,
      service: this.config.service,
      queueEnabled: this.config.queue.enabled,
      autoValidation: this.config.verification.autoValidate,
      reportingEnabled: this.config.reporting.enabled
    };
  }
}

module.exports = EmailService;
