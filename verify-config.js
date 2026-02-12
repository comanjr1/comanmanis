/**
 * Configuration Verification Script
 * Tests the email service configuration without sending emails
 */

const path = require('path');
const fs = require('fs');

console.log('=== Email Configuration Verification ===\n');

// Check if .env.example exists
console.log('1. Checking configuration files...');
const envExamplePath = path.join(__dirname, '.env.example');
if (fs.existsSync(envExamplePath)) {
  console.log('   ✓ .env.example found');
} else {
  console.log('   ✗ .env.example not found');
}

// Check if config directory exists
const configPath = path.join(__dirname, 'config', 'email.config.js');
if (fs.existsSync(configPath)) {
  console.log('   ✓ email.config.js found');
} else {
  console.log('   ✗ email.config.js not found');
}

// Check if EmailService exists
const servicePath = path.join(__dirname, 'services', 'EmailService.js');
if (fs.existsSync(servicePath)) {
  console.log('   ✓ EmailService.js found');
} else {
  console.log('   ✗ EmailService.js not found');
}

// Check if examples exist
console.log('\n2. Checking examples...');
const examples = [
  'send-single-email.js',
  'send-bulk-emails.js',
  'sendgrid-example.js',
  'mailgun-example.js',
  'aws-ses-example.js',
  'smtp-example.js'
];

examples.forEach(example => {
  const examplePath = path.join(__dirname, 'examples', example);
  if (fs.existsSync(examplePath)) {
    console.log(`   ✓ ${example} found`);
  } else {
    console.log(`   ✗ ${example} not found`);
  }
});

// Check if templates exist
console.log('\n3. Checking templates...');
const templates = [
  'email-template-professional.html',
  'email-template-newsletter.html'
];

templates.forEach(template => {
  const templatePath = path.join(__dirname, 'templates', template);
  if (fs.existsSync(templatePath)) {
    console.log(`   ✓ ${template} found`);
  } else {
    console.log(`   ✗ ${template} not found`);
  }
});

// Check if documentation exists
console.log('\n4. Checking documentation...');
const docsPath = path.join(__dirname, 'docs', 'ANTI_SPAM_CONFIGURATION.md');
if (fs.existsSync(docsPath)) {
  console.log('   ✓ ANTI_SPAM_CONFIGURATION.md found');
} else {
  console.log('   ✗ ANTI_SPAM_CONFIGURATION.md not found');
}

// Test loading configuration (without .env it should use defaults)
console.log('\n5. Testing configuration module...');
try {
  const emailConfig = require('./config/email.config');
  console.log('   ✓ Configuration module loads successfully');
  console.log(`   ✓ Default service: ${emailConfig.service}`);
  console.log(`   ✓ Rate limit: ${emailConfig.rateLimit} emails/second`);
  console.log(`   ✓ Batch size: ${emailConfig.batchSize}`);
  console.log(`   ✓ Max retries: ${emailConfig.maxRetries}`);
} catch (error) {
  console.log('   ✗ Error loading configuration:', error.message);
}

console.log('\n=== Verification Complete ===\n');
console.log('Next steps:');
console.log('1. Copy .env.example to .env');
console.log('2. Configure your email service credentials in .env');
console.log('3. Install required packages: npm install dotenv');
console.log('4. Install your provider package (e.g., npm install @sendgrid/mail)');
console.log('5. Configure DNS records (SPF, DKIM, DMARC) - see docs/ANTI_SPAM_CONFIGURATION.md');
console.log('6. Test with: node examples/send-single-email.js\n');
