/**
 * Cloud Agent Service Configuration
 * 
 * Supports multiple AI providers:
 * - OpenAI (GPT-4, GPT-3.5)
 * - Anthropic (Claude)
 * - Google AI (Gemini)
 * - Local (Custom agents)
 */

const config = {
  // Active provider: 'openai', 'anthropic', 'google', 'local'
  provider: process.env.CLOUD_AGENT_PROVIDER || 'openai',
  
  // Default model configuration
  defaultModel: process.env.CLOUD_AGENT_DEFAULT_MODEL || 'gpt-4',
  
  // Rate limiting configuration
  rateLimit: {
    maxRequestsPerMinute: parseInt(process.env.CLOUD_AGENT_RATE_LIMIT) || 60,
    maxConcurrent: parseInt(process.env.CLOUD_AGENT_MAX_CONCURRENT) || 5,
  },
  
  // Retry configuration
  retry: {
    maxRetries: parseInt(process.env.CLOUD_AGENT_MAX_RETRIES) || 3,
    initialDelay: parseInt(process.env.CLOUD_AGENT_RETRY_DELAY) || 1000,
    maxDelay: parseInt(process.env.CLOUD_AGENT_MAX_RETRY_DELAY) || 10000,
    backoffMultiplier: parseFloat(process.env.CLOUD_AGENT_BACKOFF_MULTIPLIER) || 2,
  },
  
  // Batch processing configuration
  batch: {
    maxBatchSize: parseInt(process.env.CLOUD_AGENT_BATCH_SIZE) || 10,
    batchDelayMs: parseInt(process.env.CLOUD_AGENT_BATCH_DELAY) || 100,
  },
  
  // Timeout configuration (in milliseconds)
  timeout: parseInt(process.env.CLOUD_AGENT_TIMEOUT) || 60000,
  
  // Provider-specific configurations
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORGANIZATION,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      models: {
        'gpt-4': { maxTokens: 8192, temperature: 0.7 },
        'gpt-4-turbo': { maxTokens: 128000, temperature: 0.7 },
        'gpt-3.5-turbo': { maxTokens: 4096, temperature: 0.7 },
      },
    },
    
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
      models: {
        'claude-3-opus': { maxTokens: 4096, temperature: 0.7 },
        'claude-3-sonnet': { maxTokens: 4096, temperature: 0.7 },
        'claude-3-haiku': { maxTokens: 4096, temperature: 0.7 },
      },
    },
    
    google: {
      apiKey: process.env.GOOGLE_AI_API_KEY,
      baseURL: process.env.GOOGLE_AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1',
      models: {
        'gemini-pro': { maxTokens: 2048, temperature: 0.7 },
        'gemini-pro-vision': { maxTokens: 2048, temperature: 0.7 },
      },
    },
    
    local: {
      endpoint: process.env.LOCAL_AGENT_ENDPOINT || 'http://localhost:8000',
      apiKey: process.env.LOCAL_AGENT_API_KEY,
      models: {
        'default': { maxTokens: 4096, temperature: 0.7 },
      },
    },
  },
  
  // Logging configuration
  logging: {
    enabled: process.env.CLOUD_AGENT_LOGGING !== 'false',
    level: process.env.CLOUD_AGENT_LOG_LEVEL || 'info',
    logRequests: process.env.CLOUD_AGENT_LOG_REQUESTS === 'true',
    logResponses: process.env.CLOUD_AGENT_LOG_RESPONSES === 'true',
  },
};

/**
 * Validates the configuration
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateConfig() {
  const errors = [];
  
  // Validate provider
  const validProviders = ['openai', 'anthropic', 'google', 'local'];
  if (!validProviders.includes(config.provider)) {
    errors.push(`Invalid provider: ${config.provider}. Must be one of: ${validProviders.join(', ')}`);
  }
  
  // Validate provider-specific configuration
  const providerConfig = config.providers[config.provider];
  if (!providerConfig) {
    errors.push(`No configuration found for provider: ${config.provider}`);
  } else {
    // Check for API key (required for most providers)
    if (config.provider !== 'local' && !providerConfig.apiKey) {
      errors.push(`API key not configured for provider: ${config.provider}`);
    }
    
    // Validate model exists for provider
    if (!providerConfig.models[config.defaultModel]) {
      errors.push(`Model ${config.defaultModel} not available for provider ${config.provider}`);
    }
  }
  
  // Validate rate limit settings
  if (config.rateLimit.maxRequestsPerMinute < 1) {
    errors.push('Rate limit maxRequestsPerMinute must be at least 1');
  }
  
  if (config.rateLimit.maxConcurrent < 1) {
    errors.push('Rate limit maxConcurrent must be at least 1');
  }
  
  // Validate retry settings
  if (config.retry.maxRetries < 0) {
    errors.push('Retry maxRetries must be non-negative');
  }
  
  if (config.retry.initialDelay < 0) {
    errors.push('Retry initialDelay must be non-negative');
  }
  
  // Validate batch settings
  if (config.batch.maxBatchSize < 1) {
    errors.push('Batch maxBatchSize must be at least 1');
  }
  
  // Validate timeout
  if (config.timeout < 1000) {
    errors.push('Timeout must be at least 1000ms');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  config,
  validateConfig,
};
