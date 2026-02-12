#!/usr/bin/env node

/**
 * Cloud Agent Service Configuration Verification Script
 * 
 * This script verifies:
 * - Configuration validity
 * - Provider connectivity
 * - API credentials
 * - Rate limiting setup
 * - Model availability
 * 
 * Run this before using the CloudAgentService to ensure everything is configured correctly.
 */

require('dotenv').config();
const { config, validateConfig } = require('./config/cloudagent.config');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Helper functions for formatted output
function printHeader(text) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${text}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

function printSection(text) {
  console.log(`\n${colors.bright}${colors.cyan}${text}${colors.reset}`);
  console.log(`${colors.cyan}${'-'.repeat(text.length)}${colors.reset}`);
}

function printSuccess(text) {
  console.log(`${colors.green}✓${colors.reset} ${text}`);
}

function printError(text) {
  console.log(`${colors.red}✗${colors.reset} ${text}`);
}

function printWarning(text) {
  console.log(`${colors.yellow}⚠${colors.reset} ${text}`);
}

function printInfo(text) {
  console.log(`  ${text}`);
}

/**
 * Verify basic configuration structure
 */
function verifyBasicConfig() {
  printSection('1. Configuration Structure Verification');
  
  const validation = validateConfig();
  
  if (validation.isValid) {
    printSuccess('Configuration is valid');
    printInfo(`Provider: ${config.provider}`);
    printInfo(`Default Model: ${config.defaultModel}`);
    return true;
  } else {
    printError('Configuration validation failed:');
    validation.errors.forEach(error => {
      printInfo(`  - ${error}`);
    });
    return false;
  }
}

/**
 * Verify rate limiting configuration
 */
function verifyRateLimiting() {
  printSection('2. Rate Limiting Configuration');
  
  try {
    printInfo(`Max Requests/Minute: ${config.rateLimit.maxRequestsPerMinute}`);
    printInfo(`Max Concurrent: ${config.rateLimit.maxConcurrent}`);
    
    if (config.rateLimit.maxRequestsPerMinute < 10) {
      printWarning('Low rate limit may impact batch processing performance');
    } else {
      printSuccess('Rate limiting configured appropriately');
    }
    
    return true;
  } catch (error) {
    printError(`Rate limiting verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Verify retry configuration
 */
function verifyRetryConfig() {
  printSection('3. Retry Configuration');
  
  try {
    printInfo(`Max Retries: ${config.retry.maxRetries}`);
    printInfo(`Initial Delay: ${config.retry.initialDelay}ms`);
    printInfo(`Max Delay: ${config.retry.maxDelay}ms`);
    printInfo(`Backoff Multiplier: ${config.retry.backoffMultiplier}x`);
    
    if (config.retry.maxRetries === 0) {
      printWarning('Retries disabled - requests will fail immediately on errors');
    } else {
      printSuccess('Retry configuration looks good');
    }
    
    return true;
  } catch (error) {
    printError(`Retry configuration verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Verify batch processing configuration
 */
function verifyBatchConfig() {
  printSection('4. Batch Processing Configuration');
  
  try {
    printInfo(`Max Batch Size: ${config.batch.maxBatchSize}`);
    printInfo(`Batch Delay: ${config.batch.batchDelayMs}ms`);
    printSuccess('Batch processing configured');
    return true;
  } catch (error) {
    printError(`Batch configuration verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Verify provider-specific configuration
 */
function verifyProviderConfig() {
  printSection('5. Provider-Specific Configuration');
  
  const provider = config.provider;
  const providerConfig = config.providers[provider];
  
  printInfo(`Active Provider: ${provider}`);
  
  if (!providerConfig) {
    printError(`No configuration found for provider: ${provider}`);
    return false;
  }
  
  // Check API key
  switch (provider) {
    case 'openai':
      if (!providerConfig.apiKey) {
        printError('OpenAI API key not configured (OPENAI_API_KEY)');
        return false;
      }
      if (providerConfig.apiKey === 'your-openai-api-key-here') {
        printError('OpenAI API key is still set to placeholder value');
        return false;
      }
      printSuccess('OpenAI API key is configured');
      printInfo(`Base URL: ${providerConfig.baseURL}`);
      if (providerConfig.organization) {
        printInfo(`Organization: ${providerConfig.organization}`);
      }
      break;
      
    case 'anthropic':
      if (!providerConfig.apiKey) {
        printError('Anthropic API key not configured (ANTHROPIC_API_KEY)');
        return false;
      }
      if (providerConfig.apiKey === 'your-anthropic-api-key-here') {
        printError('Anthropic API key is still set to placeholder value');
        return false;
      }
      printSuccess('Anthropic API key is configured');
      printInfo(`Base URL: ${providerConfig.baseURL}`);
      break;
      
    case 'google':
      if (!providerConfig.apiKey) {
        printError('Google AI API key not configured (GOOGLE_AI_API_KEY)');
        return false;
      }
      if (providerConfig.apiKey === 'your-google-ai-api-key-here') {
        printError('Google AI API key is still set to placeholder value');
        return false;
      }
      printSuccess('Google AI API key is configured');
      printInfo(`Base URL: ${providerConfig.baseURL}`);
      break;
      
    case 'local':
      printInfo(`Endpoint: ${providerConfig.endpoint}`);
      if (providerConfig.apiKey) {
        printSuccess('Local agent API key is configured');
      } else {
        printWarning('No API key configured for local agent (may be optional)');
      }
      break;
  }
  
  // Check model availability
  const availableModels = Object.keys(providerConfig.models);
  printInfo(`Available models: ${availableModels.join(', ')}`);
  
  if (!providerConfig.models[config.defaultModel]) {
    printError(`Default model "${config.defaultModel}" not found in available models`);
    return false;
  }
  
  printSuccess(`Default model "${config.defaultModel}" is available`);
  return true;
}

/**
 * Test provider connectivity with a simple request
 */
async function testProviderConnection() {
  printSection('6. Provider Connectivity Test');
  
  const CloudAgentService = require('./services/CloudAgentService');
  
  try {
    printInfo('Initializing CloudAgentService...');
    const service = new CloudAgentService();
    printSuccess('Service initialized successfully');
    
    printInfo('Sending test request to provider...');
    printInfo('(This will make an actual API call)');
    
    const startTime = Date.now();
    const result = await service.delegateTask({
      prompt: 'Say "Configuration verified!" and nothing else.',
      maxTokens: 50,
    });
    const duration = Date.now() - startTime;
    
    printSuccess(`Provider responded successfully in ${duration}ms`);
    printInfo(`Response: ${result.content.substring(0, 100)}${result.content.length > 100 ? '...' : ''}`);
    printInfo(`Model: ${result.model}`);
    
    if (result.usage) {
      printInfo(`Tokens used: ${JSON.stringify(result.usage)}`);
    }
    
    return true;
  } catch (error) {
    printError(`Connection test failed: ${error.message}`);
    printInfo('Common issues:');
    printInfo('  - Invalid API key');
    printInfo('  - Network connectivity problems');
    printInfo('  - Rate limiting or quota exceeded');
    printInfo('  - Incorrect base URL');
    return false;
  }
}

/**
 * Verify logging configuration
 */
function verifyLoggingConfig() {
  printSection('7. Logging Configuration');
  
  printInfo(`Logging Enabled: ${config.logging.enabled}`);
  printInfo(`Log Level: ${config.logging.level}`);
  printInfo(`Log Requests: ${config.logging.logRequests}`);
  printInfo(`Log Responses: ${config.logging.logResponses}`);
  
  if (!config.logging.enabled) {
    printWarning('Logging is disabled - debugging may be difficult');
  } else {
    printSuccess('Logging is configured');
  }
  
  return true;
}

/**
 * Generate configuration report
 */
function generateReport(results) {
  printSection('Verification Summary');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r === true).length;
  const failedTests = totalTests - passedTests;
  
  console.log('');
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      printSuccess(test);
    } else {
      printError(test);
    }
  });
  
  console.log('');
  printInfo(`Total Tests: ${totalTests}`);
  
  if (failedTests === 0) {
    printSuccess(`All tests passed (${passedTests}/${totalTests})`);
    console.log('');
    printSuccess('CloudAgentService is ready to use! 🎉');
  } else {
    printError(`${failedTests} test(s) failed`);
    printWarning(`${passedTests} test(s) passed`);
    console.log('');
    printError('Please fix the issues above before using CloudAgentService');
  }
  
  return failedTests === 0;
}

/**
 * Main verification function
 */
async function main() {
  printHeader('Cloud Agent Service Configuration Verification');
  
  const results = {
    'Configuration Structure': false,
    'Rate Limiting': false,
    'Retry Configuration': false,
    'Batch Processing': false,
    'Provider Configuration': false,
    'Logging Configuration': false,
    'Provider Connection': false,
  };
  
  // Run all verifications
  results['Configuration Structure'] = verifyBasicConfig();
  results['Rate Limiting'] = verifyRateLimiting();
  results['Retry Configuration'] = verifyRetryConfig();
  results['Batch Processing'] = verifyBatchConfig();
  results['Provider Configuration'] = verifyProviderConfig();
  results['Logging Configuration'] = verifyLoggingConfig();
  
  // Only test connection if basic config is valid
  if (results['Configuration Structure'] && results['Provider Configuration']) {
    console.log('');
    printWarning('About to test provider connection (will make an API call)');
    printInfo('Press Ctrl+C to skip this test');
    
    // Add a small delay to allow user to cancel
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    results['Provider Connection'] = await testProviderConnection();
  } else {
    printWarning('Skipping connection test due to configuration errors');
  }
  
  // Generate final report
  const success = generateReport(results);
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Run verification if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error(`\n${colors.red}Fatal error:${colors.reset}`, error.message);
    process.exit(1);
  });
}

module.exports = {
  verifyBasicConfig,
  verifyRateLimiting,
  verifyRetryConfig,
  verifyBatchConfig,
  verifyProviderConfig,
  verifyLoggingConfig,
  testProviderConnection,
};
