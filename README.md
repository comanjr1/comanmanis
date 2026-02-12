# Cloud Agent Service

A production-ready service for delegating tasks to cloud-based AI agents with support for multiple providers, rate limiting, retry logic, and batch processing.

## Features

- 🔌 **Multi-Provider Support**: OpenAI, Anthropic, Google AI, and Local agents
- 🚀 **Async Task Delegation**: Promise-based API for easy integration
- ⚡ **Rate Limiting**: Configurable request rate and concurrency limits
- 🔄 **Retry Logic**: Exponential backoff for failed requests
- 📦 **Batch Processing**: Process multiple tasks efficiently
- ✅ **Configuration Validation**: Validate settings on initialization
- 📊 **Service Statistics**: Monitor request metrics
- 🪵 **Comprehensive Logging**: Configurable logging levels

## Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your API keys
3. Install dependencies (if any are added in the future)

```bash
cp .env.example .env
# Edit .env with your API keys
```

## Quick Start

```javascript
const CloudAgentService = require('./services/CloudAgentService');

// Initialize the service
const agentService = new CloudAgentService();

// Delegate a single task
const result = await agentService.delegateTask({
  prompt: 'Explain quantum computing in simple terms',
});

console.log(result.content);
```

## Configuration

### Environment Variables

Configure the service using environment variables in your `.env` file:

```bash
# Provider Selection
CLOUD_AGENT_PROVIDER=openai

# Default Model
CLOUD_AGENT_DEFAULT_MODEL=gpt-4

# API Keys
OPENAI_API_KEY=your-api-key
ANTHROPIC_API_KEY=your-api-key
GOOGLE_AI_API_KEY=your-api-key

# Rate Limiting
CLOUD_AGENT_RATE_LIMIT=60
CLOUD_AGENT_MAX_CONCURRENT=5

# Retry Configuration
CLOUD_AGENT_MAX_RETRIES=3
CLOUD_AGENT_RETRY_DELAY=1000

# Batch Processing
CLOUD_AGENT_BATCH_SIZE=10
CLOUD_AGENT_BATCH_DELAY=100
```

See `.env.example` for all available configuration options.

### Custom Configuration

You can also pass a custom configuration object:

```javascript
const customConfig = {
  provider: 'openai',
  defaultModel: 'gpt-4',
  rateLimit: {
    maxRequestsPerMinute: 30,
    maxConcurrent: 3,
  },
  retry: {
    maxRetries: 2,
    initialDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 2,
  },
  // ... other options
};

const agentService = new CloudAgentService(customConfig);
```

## Usage Examples

### Single Task Delegation

```javascript
const result = await agentService.delegateTask({
  prompt: 'Write a haiku about programming',
  model: 'gpt-3.5-turbo',  // Optional: override default model
  temperature: 0.9,         // Optional: control randomness
  maxTokens: 100,           // Optional: limit response length
});

console.log(result.content);
```

### Batch Processing

```javascript
const tasks = [
  { prompt: 'What is the capital of France?' },
  { prompt: 'What is the capital of Japan?' },
  { prompt: 'What is the capital of Brazil?' },
];

const results = await agentService.delegateBatch(tasks, {
  failFast: false,  // Continue even if some tasks fail
  ordered: true,    // Preserve order in results
});

results.forEach((result, index) => {
  console.log(`Task ${index + 1}:`, result.content);
});
```

### Streaming Response

```javascript
const result = await agentService.delegateTaskStream(
  {
    prompt: 'Tell me a story',
  },
  (chunk) => {
    // Handle each chunk as it arrives
    process.stdout.write(chunk.content);
  }
);
```

### Service Statistics

```javascript
const stats = agentService.getStats();
console.log('Active requests:', stats.activeRequests);
console.log('Requests in last minute:', stats.requestsInLastMinute);
console.log('Queue length:', stats.queueLength);
```

## Supported Providers

### OpenAI

```bash
CLOUD_AGENT_PROVIDER=openai
CLOUD_AGENT_DEFAULT_MODEL=gpt-4
OPENAI_API_KEY=your-api-key
```

Supported models:
- `gpt-4`
- `gpt-4-turbo`
- `gpt-3.5-turbo`

### Anthropic

```bash
CLOUD_AGENT_PROVIDER=anthropic
CLOUD_AGENT_DEFAULT_MODEL=claude-3-opus
ANTHROPIC_API_KEY=your-api-key
```

Supported models:
- `claude-3-opus`
- `claude-3-sonnet`
- `claude-3-haiku`

### Google AI

```bash
CLOUD_AGENT_PROVIDER=google
CLOUD_AGENT_DEFAULT_MODEL=gemini-pro
GOOGLE_AI_API_KEY=your-api-key
```

Supported models:
- `gemini-pro`
- `gemini-pro-vision`

### Local Agent

```bash
CLOUD_AGENT_PROVIDER=local
LOCAL_AGENT_ENDPOINT=http://localhost:8000
LOCAL_AGENT_API_KEY=optional-api-key
```

## Error Handling

The service includes comprehensive error handling with automatic retries:

```javascript
try {
  const result = await agentService.delegateTask({
    prompt: 'Your task here',
  });
  console.log(result.content);
} catch (error) {
  console.error('Task failed after retries:', error.message);
}
```

## Rate Limiting

The service automatically handles rate limiting:

- **Requests per minute**: Limits total requests in a 60-second window
- **Concurrent requests**: Limits simultaneous active requests
- **Automatic queuing**: Requests wait automatically when limits are reached

## Retry Logic

Failed requests are automatically retried with exponential backoff:

1. First retry: Initial delay (default: 1000ms)
2. Second retry: Initial delay × backoff multiplier (default: 2000ms)
3. Third retry: Previous delay × backoff multiplier (default: 4000ms)
4. Continues until max retries or max delay reached

## Logging

Configure logging behavior:

```bash
CLOUD_AGENT_LOGGING=true
CLOUD_AGENT_LOG_LEVEL=info  # debug, info, warn, error
CLOUD_AGENT_LOG_REQUESTS=true
CLOUD_AGENT_LOG_RESPONSES=true
```

## API Reference

### CloudAgentService

#### Constructor

```javascript
new CloudAgentService(customConfig?)
```

#### Methods

##### delegateTask(task)

Delegate a single task to the cloud agent.

**Parameters:**
- `task` (Object)
  - `prompt` (string, required): The task prompt/instruction
  - `model` (string, optional): Override default model
  - `temperature` (number, optional): Control randomness (0-1)
  - `maxTokens` (number, optional): Maximum response length
  - `options` (Object, optional): Additional provider-specific options

**Returns:** Promise<Object>
- `content` (string): Agent response
- `model` (string): Model used
- `usage` (Object): Token usage information
- `finishReason` (string): Why the generation stopped

##### delegateBatch(tasks, options?)

Delegate multiple tasks in batch.

**Parameters:**
- `tasks` (Array<Object>): Array of task configurations
- `options` (Object, optional)
  - `failFast` (boolean): Stop on first error (default: false)
  - `ordered` (boolean): Preserve order in results (default: false)

**Returns:** Promise<Array<Object>>

##### delegateTaskStream(task, onChunk)

Stream task execution for long-running tasks.

**Parameters:**
- `task` (Object): Task configuration
- `onChunk` (Function): Callback for each chunk

**Returns:** Promise<Object>

##### getStats()

Get service statistics.

**Returns:** Object
- `provider` (string): Active provider
- `activeRequests` (number): Currently active requests
- `requestsInLastMinute` (number): Requests in the last 60 seconds
- `queueLength` (number): Queued requests

## Architecture

The service follows a provider pattern architecture:

```
CloudAgentService
├── BaseProvider (abstract)
│   ├── OpenAIProvider
│   ├── AnthropicProvider
│   ├── GoogleProvider
│   └── LocalProvider
└── Configuration (cloudagent.config.js)
```

Each provider implements:
- `executeTask(task)`: Execute a single task
- `executeTaskStream(task, onChunk)`: Execute with streaming

## Best Practices

1. **Configure Rate Limits**: Set appropriate limits for your use case
2. **Use Batch Processing**: For multiple tasks, use `delegateBatch` instead of individual calls
3. **Handle Errors**: Always wrap calls in try-catch blocks
4. **Monitor Statistics**: Use `getStats()` to monitor service health
5. **Secure API Keys**: Never commit `.env` file to version control
6. **Choose Right Model**: Balance cost and performance for your needs

## Examples

See `examples/usage.js` for comprehensive usage examples:

```bash
node examples/usage.js
```

## Security

- API keys are loaded from environment variables
- Never commit `.env` file to version control
- Use `.gitignore` to exclude sensitive files
- Validate all configuration on initialization

## License

MIT

## Contributing

Contributions are welcome! Please ensure:
- Code follows existing patterns
- Add tests for new features
- Update documentation
- Follow error handling conventions