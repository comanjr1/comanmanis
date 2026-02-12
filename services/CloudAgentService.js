/**
 * Cloud Agent Service
 * 
 * A production-ready service for delegating tasks to cloud-based AI agents.
 * Supports multiple providers with rate limiting, retry logic, and batch processing.
 * 
 * @module CloudAgentService
 */

const { config, validateConfig } = require('../config/cloudagent.config');

class CloudAgentService {
  constructor(customConfig = null) {
    this.config = customConfig || config;
    this.activeRequests = 0;
    this.requestTimestamps = [];
    
    // Validate configuration on initialization
    const validation = validateConfig();
    if (!validation.isValid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }
    
    this.provider = this._initializeProvider();
    this._log('info', `CloudAgentService initialized with provider: ${this.config.provider}`);
  }
  
  /**
   * Initialize the appropriate provider based on configuration
   * @private
   */
  _initializeProvider() {
    const providerConfig = this.config.providers[this.config.provider];
    
    switch (this.config.provider) {
      case 'openai':
        return new OpenAIProvider(providerConfig, this.config);
      case 'anthropic':
        return new AnthropicProvider(providerConfig, this.config);
      case 'google':
        return new GoogleProvider(providerConfig, this.config);
      case 'local':
        return new LocalProvider(providerConfig, this.config);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }
  
  /**
   * Delegate a single task to the cloud agent
   * @param {Object} task - Task configuration
   * @param {string} task.prompt - The task prompt/instruction
   * @param {string} [task.model] - Override default model
   * @param {Object} [task.options] - Additional options
   * @returns {Promise<Object>} Agent response
   */
  async delegateTask(task) {
    this._validateTask(task);
    
    return this._executeWithRetry(async () => {
      await this._checkRateLimit();
      return await this.provider.executeTask(task);
    });
  }
  
  /**
   * Delegate multiple tasks in batch with rate limiting
   * @param {Array<Object>} tasks - Array of task configurations
   * @param {Object} [options] - Batch processing options
   * @param {boolean} [options.failFast=false] - Stop on first error
   * @param {boolean} [options.ordered=false] - Preserve order in results
   * @returns {Promise<Array<Object>>} Array of results
   */
  async delegateBatch(tasks, options = {}) {
    const { failFast = false, ordered = false } = options;
    
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error('Tasks must be a non-empty array');
    }
    
    this._log('info', `Processing batch of ${tasks.length} tasks`);
    
    const batches = this._createBatches(tasks);
    const results = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      this._log('debug', `Processing batch ${i + 1}/${batches.length} with ${batch.length} tasks`);
      
      try {
        const batchResults = await Promise.all(
          batch.map(task => this.delegateTask(task))
        );
        results.push(...batchResults);
        
        // Add delay between batches to respect rate limits
        if (i < batches.length - 1) {
          await this._delay(this.config.batch.batchDelayMs);
        }
      } catch (error) {
        if (failFast) {
          throw new Error(`Batch processing failed at batch ${i + 1}: ${error.message}`);
        }
        this._log('error', `Error in batch ${i + 1}:`, error);
        results.push({ error: error.message, batch: i + 1 });
      }
    }
    
    return ordered ? results : results.filter(r => !r.error);
  }
  
  /**
   * Stream task execution for long-running tasks
   * @param {Object} task - Task configuration
   * @param {Function} onChunk - Callback for each chunk
   * @returns {Promise<Object>} Final result
   */
  async delegateTaskStream(task, onChunk) {
    this._validateTask(task);
    
    if (typeof onChunk !== 'function') {
      throw new Error('onChunk must be a function');
    }
    
    return this._executeWithRetry(async () => {
      await this._checkRateLimit();
      return await this.provider.executeTaskStream(task, onChunk);
    });
  }
  
  /**
   * Validate task configuration
   * @private
   */
  _validateTask(task) {
    if (!task || typeof task !== 'object') {
      throw new Error('Task must be an object');
    }
    
    if (!task.prompt || typeof task.prompt !== 'string') {
      throw new Error('Task must have a valid prompt string');
    }
    
    if (task.model) {
      const providerConfig = this.config.providers[this.config.provider];
      if (!providerConfig.models[task.model]) {
        throw new Error(`Model ${task.model} not available for provider ${this.config.provider}`);
      }
    }
  }
  
  /**
   * Execute function with retry logic
   * @private
   */
  async _executeWithRetry(fn, attempt = 0) {
    try {
      this.activeRequests++;
      const result = await this._withTimeout(fn(), this.config.timeout);
      this.activeRequests--;
      return result;
    } catch (error) {
      this.activeRequests--;
      
      if (attempt >= this.config.retry.maxRetries) {
        this._log('error', `Max retries (${this.config.retry.maxRetries}) reached`, error);
        throw error;
      }
      
      const delay = Math.min(
        this.config.retry.initialDelay * Math.pow(this.config.retry.backoffMultiplier, attempt),
        this.config.retry.maxDelay
      );
      
      this._log('warn', `Retry attempt ${attempt + 1}/${this.config.retry.maxRetries} after ${delay}ms`);
      await this._delay(delay);
      
      return this._executeWithRetry(fn, attempt + 1);
    }
  }
  
  /**
   * Check and enforce rate limits
   * @private
   */
  async _checkRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneMinuteAgo);
    
    // Check requests per minute limit
    if (this.requestTimestamps.length >= this.config.rateLimit.maxRequestsPerMinute) {
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = oldestTimestamp + 60000 - now;
      this._log('debug', `Rate limit reached, waiting ${waitTime}ms`);
      await this._delay(waitTime);
      return this._checkRateLimit();
    }
    
    // Check concurrent requests limit
    while (this.activeRequests >= this.config.rateLimit.maxConcurrent) {
      this._log('debug', `Max concurrent requests (${this.config.rateLimit.maxConcurrent}) reached, waiting...`);
      await this._delay(100);
    }
    
    this.requestTimestamps.push(now);
  }
  
  /**
   * Split tasks into batches
   * @private
   */
  _createBatches(tasks) {
    const batches = [];
    for (let i = 0; i < tasks.length; i += this.config.batch.maxBatchSize) {
      batches.push(tasks.slice(i, i + this.config.batch.maxBatchSize));
    }
    return batches;
  }
  
  /**
   * Add timeout to a promise
   * @private
   */
  _withTimeout(promise, timeoutMs) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }
  
  /**
   * Delay helper
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Logging helper
   * @private
   */
  _log(level, message, data = null) {
    if (!this.config.logging.enabled) return;
    
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const configLevel = levels[this.config.logging.level] || 1;
    
    if (levels[level] >= configLevel) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [CloudAgentService] [${level.toUpperCase()}] ${message}`;
      
      if (data) {
        console[level === 'error' ? 'error' : 'log'](logMessage, data);
      } else {
        console[level === 'error' ? 'error' : 'log'](logMessage);
      }
    }
  }
  
  /**
   * Get service statistics
   * @returns {Object} Service statistics
   */
  getStats() {
    return {
      provider: this.config.provider,
      activeRequests: this.activeRequests,
      requestsInLastMinute: this.requestTimestamps.length,
    };
  }
}

/**
 * Base Provider Class
 * @private
 */
class BaseProvider {
  constructor(providerConfig, globalConfig) {
    this.config = providerConfig;
    this.globalConfig = globalConfig;
  }
  
  async executeTask(task) {
    throw new Error('executeTask must be implemented by provider');
  }
  
  async executeTaskStream(task, onChunk) {
    throw new Error('executeTaskStream must be implemented by provider');
  }
  
  _getModel(task) {
    return task.model || this.globalConfig.defaultModel;
  }
  
  _getModelConfig(model) {
    return this.config.models[model] || this.config.models['default'] || {};
  }
}

/**
 * OpenAI Provider
 * @private
 */
class OpenAIProvider extends BaseProvider {
  async executeTask(task) {
    const model = this._getModel(task);
    const modelConfig = this._getModelConfig(model);
    
    const requestBody = {
      model,
      messages: [{ role: 'user', content: task.prompt }],
      max_tokens: task.maxTokens || modelConfig.maxTokens,
      temperature: task.temperature ?? modelConfig.temperature,
      ...task.options,
    };
    
    const response = await this._makeRequest('/chat/completions', requestBody);
    
    return {
      content: response.choices[0].message.content,
      model: response.model,
      usage: response.usage,
      finishReason: response.choices[0].finish_reason,
    };
  }
  
  async executeTaskStream(task, onChunk) {
    const model = this._getModel(task);
    const modelConfig = this._getModelConfig(model);
    
    const requestBody = {
      model,
      messages: [{ role: 'user', content: task.prompt }],
      max_tokens: task.maxTokens || modelConfig.maxTokens,
      temperature: task.temperature ?? modelConfig.temperature,
      stream: true,
      ...task.options,
    };
    
    // Simplified streaming implementation
    const response = await this._makeRequest('/chat/completions', requestBody);
    
    // In a real implementation, this would handle SSE streaming
    onChunk({ content: response.choices[0].message.content });
    
    return {
      content: response.choices[0].message.content,
      model: response.model,
    };
  }
  
  async _makeRequest(endpoint, body) {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };
    
    if (this.config.organization) {
      headers['OpenAI-Organization'] = this.config.organization;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }
    
    return response.json();
  }
}

/**
 * Anthropic Provider
 * @private
 */
class AnthropicProvider extends BaseProvider {
  async executeTask(task) {
    const model = this._getModel(task);
    const modelConfig = this._getModelConfig(model);
    
    const requestBody = {
      model,
      messages: [{ role: 'user', content: task.prompt }],
      max_tokens: task.maxTokens || modelConfig.maxTokens,
      temperature: task.temperature ?? modelConfig.temperature,
      ...task.options,
    };
    
    const response = await this._makeRequest('/messages', requestBody);
    
    return {
      content: response.content[0].text,
      model: response.model,
      usage: response.usage,
      stopReason: response.stop_reason,
    };
  }
  
  async executeTaskStream(task, onChunk) {
    // Similar to OpenAI but with Anthropic's streaming format
    const result = await this.executeTask(task);
    onChunk({ content: result.content });
    return result;
  }
  
  async _makeRequest(endpoint, body) {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }
    
    return response.json();
  }
}

/**
 * Google AI Provider
 * @private
 */
class GoogleProvider extends BaseProvider {
  async executeTask(task) {
    const model = this._getModel(task);
    const modelConfig = this._getModelConfig(model);
    
    const requestBody = {
      contents: [{ parts: [{ text: task.prompt }] }],
      generationConfig: {
        maxOutputTokens: task.maxTokens || modelConfig.maxTokens,
        temperature: task.temperature ?? modelConfig.temperature,
      },
      ...task.options,
    };
    
    const response = await this._makeRequest(`/models/${model}:generateContent`, requestBody);
    
    return {
      content: response.candidates[0].content.parts[0].text,
      model,
      usage: response.usageMetadata,
      finishReason: response.candidates[0].finishReason,
    };
  }
  
  async executeTaskStream(task, onChunk) {
    const result = await this.executeTask(task);
    onChunk({ content: result.content });
    return result;
  }
  
  async _makeRequest(endpoint, body) {
    const url = `${this.config.baseURL}${endpoint}?key=${this.config.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Google AI API error: ${error.error?.message || response.statusText}`);
    }
    
    return response.json();
  }
}

/**
 * Local Provider (for custom/self-hosted agents)
 * @private
 */
class LocalProvider extends BaseProvider {
  async executeTask(task) {
    const model = this._getModel(task);
    const modelConfig = this._getModelConfig(model);
    
    const requestBody = {
      model,
      prompt: task.prompt,
      max_tokens: task.maxTokens || modelConfig.maxTokens,
      temperature: task.temperature ?? modelConfig.temperature,
      ...task.options,
    };
    
    const response = await this._makeRequest('/generate', requestBody);
    
    return {
      content: response.text || response.content,
      model: response.model || model,
      usage: response.usage,
    };
  }
  
  async executeTaskStream(task, onChunk) {
    const result = await this.executeTask(task);
    onChunk({ content: result.content });
    return result;
  }
  
  async _makeRequest(endpoint, body) {
    const url = `${this.config.endpoint}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Local agent error: ${error.error?.message || response.statusText}`);
    }
    
    return response.json();
  }
}

module.exports = CloudAgentService;
