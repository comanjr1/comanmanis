# API Reference

## CloudAgentService Class

The main class for interacting with cloud AI agents.

### Constructor

```javascript
new CloudAgentService(customConfig?)
```

**Parameters:**
- `customConfig` (Object, optional): Custom configuration object. If not provided, uses default configuration from `config/cloudagent.config.js`

**Throws:**
- Error if configuration validation fails

**Example:**
```javascript
const service = new CloudAgentService();

// Or with custom config
const service = new CloudAgentService({
  provider: 'openai',
  defaultModel: 'gpt-4',
  rateLimit: {
    maxRequestsPerMinute: 30,
    maxConcurrent: 5,
  },
  // ... other config options
});
```

---

### Methods

#### delegateTask(task)

Delegate a single task to the cloud agent with automatic retry on failure.

**Parameters:**
- `task` (Object):
  - `prompt` (string, required): The task instruction/prompt
  - `model` (string, optional): Model to use (overrides default)
  - `temperature` (number, optional): Sampling temperature (0-1)
  - `maxTokens` (number, optional): Maximum tokens in response
  - `options` (Object, optional): Provider-specific options

**Returns:** `Promise<Object>`
- `content` (string): The generated response
- `model` (string): The model that was used
- `usage` (Object): Token usage statistics
- `finishReason` (string): Why generation stopped

**Throws:**
- Error if task validation fails
- Error if all retries are exhausted
- Error if request times out

**Example:**
```javascript
const result = await service.delegateTask({
  prompt: 'Explain React hooks',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 500,
});

console.log(result.content);
```

---

#### delegateBatch(tasks, options?)

Process multiple tasks in batches with rate limiting and error handling.

**Parameters:**
- `tasks` (Array<Object>, required): Array of task configurations
- `options` (Object, optional):
  - `failFast` (boolean): Stop processing on first error (default: false)
  - `ordered` (boolean): Return results in original order, including errors (default: false)

**Returns:** `Promise<Array<Object>>`
- Array of result objects (same structure as `delegateTask`)
- If `ordered: false`, only successful results are returned
- If `ordered: true`, array includes error objects: `{ error: string, batch: number }`

**Throws:**
- Error if tasks is not a non-empty array
- Error if `failFast: true` and a task fails

**Example:**
```javascript
const tasks = [
  { prompt: 'Translate "hello" to Spanish' },
  { prompt: 'Translate "goodbye" to French' },
  { prompt: 'Translate "thank you" to German' },
];

const results = await service.delegateBatch(tasks, {
  failFast: false,
  ordered: true,
});

results.forEach((result, i) => {
  if (result.error) {
    console.error(`Task ${i} failed:`, result.error);
  } else {
    console.log(`Task ${i}:`, result.content);
  }
});
```

---

#### delegateTaskStream(task, onChunk)

Execute a task with streaming responses for real-time output.

**Parameters:**
- `task` (Object): Task configuration (same as `delegateTask`)
- `onChunk` (Function, required): Callback invoked for each response chunk
  - Receives: `{ content: string }`

**Returns:** `Promise<Object>`
- Final result object (same as `delegateTask`)

**Throws:**
- Error if task validation fails
- Error if onChunk is not a function
- Error if request fails or times out

**Example:**
```javascript
const result = await service.delegateTaskStream(
  { prompt: 'Write a story about AI' },
  (chunk) => {
    process.stdout.write(chunk.content);
  }
);

console.log('\n\nGeneration complete!');
```

---

#### getStats()

Get current service statistics for monitoring.

**Parameters:** None

**Returns:** `Object`
- `provider` (string): Active provider name
- `activeRequests` (number): Currently executing requests
- `requestsInLastMinute` (number): Requests made in last 60 seconds
- `queueLength` (number): Queued requests waiting to execute

**Example:**
```javascript
const stats = service.getStats();

console.log(`Provider: ${stats.provider}`);
console.log(`Active: ${stats.activeRequests}`);
console.log(`Last minute: ${stats.requestsInLastMinute}`);
console.log(`Queued: ${stats.queueLength}`);
```

---

## Configuration Object

Complete configuration object structure:

```javascript
{
  // Provider selection
  provider: 'openai' | 'anthropic' | 'google' | 'local',
  
  // Default model
  defaultModel: string,
  
  // Rate limiting
  rateLimit: {
    maxRequestsPerMinute: number,
    maxConcurrent: number,
  },
  
  // Retry configuration
  retry: {
    maxRetries: number,
    initialDelay: number,        // milliseconds
    maxDelay: number,            // milliseconds
    backoffMultiplier: number,   // exponential backoff factor
  },
  
  // Batch processing
  batch: {
    maxBatchSize: number,        // tasks per batch
    batchDelayMs: number,        // delay between batches
  },
  
  // Timeout
  timeout: number,               // milliseconds
  
  // Provider configurations
  providers: {
    openai: {
      apiKey: string,
      organization: string | undefined,
      baseURL: string,
      models: {
        [modelName: string]: {
          maxTokens: number,
          temperature: number,
        }
      }
    },
    anthropic: { /* ... */ },
    google: { /* ... */ },
    local: { /* ... */ },
  },
  
  // Logging
  logging: {
    enabled: boolean,
    level: 'debug' | 'info' | 'warn' | 'error',
    logRequests: boolean,
    logResponses: boolean,
  },
}
```

---

## Error Handling

The service throws errors in the following scenarios:

### Configuration Errors

Thrown during initialization:

```javascript
try {
  const service = new CloudAgentService(invalidConfig);
} catch (error) {
  console.error('Configuration error:', error.message);
  // Example: "Invalid configuration: API key not configured for provider: openai"
}
```

### Validation Errors

Thrown when calling methods with invalid parameters:

```javascript
try {
  await service.delegateTask({ /* missing prompt */ });
} catch (error) {
  console.error('Validation error:', error.message);
  // Example: "Task must have a valid prompt string"
}
```

### Request Errors

Thrown after all retries are exhausted:

```javascript
try {
  const result = await service.delegateTask({ prompt: 'Test' });
} catch (error) {
  console.error('Request error:', error.message);
  // Example: "OpenAI API error: Invalid API key"
}
```

### Timeout Errors

Thrown when request exceeds timeout:

```javascript
try {
  const result = await service.delegateTask({ prompt: 'Long task' });
} catch (error) {
  console.error('Timeout error:', error.message);
  // Example: "Request timeout after 60000ms"
}
```

---

## Provider-Specific Details

### OpenAI

**Configuration:**
```javascript
providers: {
  openai: {
    apiKey: 'sk-...',
    organization: 'org-...',  // optional
    baseURL: 'https://api.openai.com/v1',
    models: {
      'gpt-4': { maxTokens: 8192, temperature: 0.7 },
      'gpt-4-turbo': { maxTokens: 128000, temperature: 0.7 },
      'gpt-3.5-turbo': { maxTokens: 4096, temperature: 0.7 },
    },
  },
}
```

**Response Format:**
```javascript
{
  content: string,
  model: string,
  usage: {
    prompt_tokens: number,
    completion_tokens: number,
    total_tokens: number,
  },
  finishReason: 'stop' | 'length' | 'content_filter' | 'null',
}
```

### Anthropic

**Configuration:**
```javascript
providers: {
  anthropic: {
    apiKey: 'sk-ant-...',
    baseURL: 'https://api.anthropic.com/v1',
    models: {
      'claude-3-opus': { maxTokens: 4096, temperature: 0.7 },
      'claude-3-sonnet': { maxTokens: 4096, temperature: 0.7 },
      'claude-3-haiku': { maxTokens: 4096, temperature: 0.7 },
    },
  },
}
```

**Response Format:**
```javascript
{
  content: string,
  model: string,
  usage: {
    input_tokens: number,
    output_tokens: number,
  },
  stopReason: 'end_turn' | 'max_tokens' | 'stop_sequence',
}
```

### Google AI

**Configuration:**
```javascript
providers: {
  google: {
    apiKey: 'AIza...',
    baseURL: 'https://generativelanguage.googleapis.com/v1',
    models: {
      'gemini-pro': { maxTokens: 2048, temperature: 0.7 },
      'gemini-pro-vision': { maxTokens: 2048, temperature: 0.7 },
    },
  },
}
```

**Response Format:**
```javascript
{
  content: string,
  model: string,
  usage: {
    promptTokenCount: number,
    candidatesTokenCount: number,
    totalTokenCount: number,
  },
  finishReason: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER',
}
```

### Local

**Configuration:**
```javascript
providers: {
  local: {
    endpoint: 'http://localhost:8000',
    apiKey: 'optional',  // if required by your local agent
    models: {
      'default': { maxTokens: 4096, temperature: 0.7 },
    },
  },
}
```

**Response Format:**
```javascript
{
  content: string,
  model: string,
  usage: Object | undefined,
}
```

---

## Best Practices

### 1. Handle Errors Properly

Always wrap service calls in try-catch blocks:

```javascript
try {
  const result = await service.delegateTask({ prompt: 'Task' });
  // Handle success
} catch (error) {
  // Handle error
  console.error('Task failed:', error.message);
}
```

### 2. Use Batch Processing

For multiple tasks, batch processing is more efficient:

```javascript
// ❌ Don't do this
for (const task of tasks) {
  const result = await service.delegateTask(task);
}

// ✅ Do this instead
const results = await service.delegateBatch(tasks);
```

### 3. Monitor Service Statistics

Check statistics to ensure service health:

```javascript
setInterval(() => {
  const stats = service.getStats();
  if (stats.activeRequests > 10) {
    console.warn('High load detected');
  }
}, 10000);
```

### 4. Configure Appropriate Timeouts

Adjust timeout based on expected task duration:

```javascript
const service = new CloudAgentService({
  timeout: 120000,  // 2 minutes for long tasks
  // ... other config
});
```

### 5. Use Appropriate Models

Choose models based on task complexity and cost:

```javascript
// Simple tasks - use faster, cheaper models
await service.delegateTask({
  prompt: 'Translate "hello"',
  model: 'gpt-3.5-turbo',
});

// Complex tasks - use more capable models
await service.delegateTask({
  prompt: 'Analyze this complex data...',
  model: 'gpt-4',
});
```
