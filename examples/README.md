# CloudAgentService Examples

This directory contains comprehensive examples demonstrating how to use the CloudAgentService with different providers and use cases.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Verify your configuration:**
   ```bash
   npm run verify
   ```

4. **Run examples:**
   ```bash
   npm run example:simple
   ```

## Examples Overview

### Basic Examples

#### `simple-delegation.js`
Learn the fundamentals of CloudAgentService:
- Basic task delegation
- Custom model selection
- Sequential task processing
- Service statistics
- Error handling

**Run:**
```bash
npm run example:simple
```

#### `batch-delegation.js`
Master batch processing capabilities:
- Basic batch processing
- Ordered vs unordered results
- Fail-fast vs continue-on-error
- Large batch handling
- Data transformation pipelines
- Progress tracking

**Run:**
```bash
npm run example:batch
```

### Provider-Specific Examples

#### `provider-examples/openai-example.js`
OpenAI/GPT-specific features:
- GPT-4 for complex reasoning
- GPT-3.5-turbo for fast tasks
- Temperature control
- Code generation
- Batch processing with model selection
- Streaming responses

**Run:**
```bash
npm run example:openai
```

**Requirements:**
- `OPENAI_API_KEY` in .env

#### `provider-examples/anthropic-example.js`
Anthropic/Claude-specific features:
- Claude 3 Opus for complex analysis
- Claude 3 Sonnet for balanced tasks
- Claude 3 Haiku for fast responses
- Text summarization
- Batch processing
- Creative writing
- Model comparison

**Run:**
```bash
npm run example:anthropic
```

**Requirements:**
- `ANTHROPIC_API_KEY` in .env

#### `provider-examples/google-example.js`
Google AI/Gemini-specific features:
- Gemini Pro text generation
- Question answering
- Creative content generation
- Code explanation
- Text classification
- Multi-step reasoning
- Data extraction

**Run:**
```bash
npm run example:google
```

**Requirements:**
- `GOOGLE_AI_API_KEY` in .env

#### `provider-examples/local-example.js`
Local/self-hosted agent features:
- Basic local agent usage
- Ollama integration
- High-throughput batch processing
- Cost-free unlimited usage
- Privacy-focused processing
- Custom model switching
- Performance insights

**Run:**
```bash
npm run example:local
```

**Requirements:**
- Local agent server running (e.g., Ollama, LocalAI)
- `LOCAL_AGENT_ENDPOINT` in .env

## Common Use Cases

### 1. Simple Question Answering
```javascript
const agentService = new CloudAgentService();
const result = await agentService.delegateTask({
  prompt: 'What is the capital of France?',
});
console.log(result.content);
```

### 2. Batch Processing
```javascript
const tasks = [
  { prompt: 'Task 1' },
  { prompt: 'Task 2' },
  { prompt: 'Task 3' },
];
const results = await agentService.delegateBatch(tasks);
```

### 3. Custom Model
```javascript
const result = await agentService.delegateTask({
  prompt: 'Write code',
  model: 'gpt-4',
  temperature: 0.2,
});
```

### 4. Streaming Response
```javascript
await agentService.delegateTaskStream(
  { prompt: 'Tell a story' },
  (chunk) => console.log(chunk.content)
);
```

## Configuration Examples

### OpenAI Configuration
```javascript
const config = {
  provider: 'openai',
  defaultModel: 'gpt-4',
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.openai.com/v1',
      models: {
        'gpt-4': { maxTokens: 8192, temperature: 0.7 },
      },
    },
  },
  // ... other config
};
```

### Anthropic Configuration
```javascript
const config = {
  provider: 'anthropic',
  defaultModel: 'claude-3-sonnet',
  providers: {
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseURL: 'https://api.anthropic.com/v1',
      models: {
        'claude-3-sonnet': { maxTokens: 4096, temperature: 0.7 },
      },
    },
  },
  // ... other config
};
```

### Google AI Configuration
```javascript
const config = {
  provider: 'google',
  defaultModel: 'gemini-pro',
  providers: {
    google: {
      apiKey: process.env.GOOGLE_AI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1',
      models: {
        'gemini-pro': { maxTokens: 2048, temperature: 0.7 },
      },
    },
  },
  // ... other config
};
```

### Local Agent Configuration
```javascript
const config = {
  provider: 'local',
  defaultModel: 'default',
  providers: {
    local: {
      endpoint: 'http://localhost:8000',
      apiKey: process.env.LOCAL_AGENT_API_KEY, // optional
      models: {
        'default': { maxTokens: 4096, temperature: 0.7 },
      },
    },
  },
  // ... other config
};
```

## Environment Variables

Required variables (at least one provider):

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google AI
GOOGLE_AI_API_KEY=...

# Local Agent
LOCAL_AGENT_ENDPOINT=http://localhost:8000
LOCAL_AGENT_API_KEY=... # optional
```

Optional configuration:
```bash
CLOUD_AGENT_PROVIDER=openai
CLOUD_AGENT_DEFAULT_MODEL=gpt-4
CLOUD_AGENT_RATE_LIMIT=60
CLOUD_AGENT_MAX_CONCURRENT=5
CLOUD_AGENT_TIMEOUT=60000
```

See `.env.example` for full list.

## Troubleshooting

### Verification fails
Run the verification script to diagnose issues:
```bash
npm run verify
```

### API Key Issues
- Ensure your API key is correctly set in `.env`
- Check that the key hasn't expired
- Verify you have sufficient credits/quota

### Connection Timeouts
- Check your internet connection
- Increase timeout in configuration
- Verify the provider's API endpoint is accessible

### Rate Limiting
- Reduce `maxConcurrent` in configuration
- Increase `batchDelayMs` for batch operations
- Use a local provider for unlimited requests

### Model Not Available
- Verify the model name is correct
- Check if you have access to the model
- See provider documentation for available models

## Best Practices

1. **Start Simple**: Begin with `simple-delegation.js` before advanced features
2. **Verify First**: Always run `npm run verify` before production use
3. **Handle Errors**: Implement proper error handling and retries
4. **Monitor Usage**: Use `getStats()` to track service usage
5. **Choose Right Model**: Balance cost/performance based on task complexity
6. **Batch When Possible**: Use batch processing for multiple similar tasks
7. **Set Appropriate Timeouts**: Configure timeouts based on expected response time
8. **Use Local for Development**: Consider local agents for development/testing

## Additional Resources

- [Main Documentation](../docs/README.md)
- [Configuration Guide](../config/cloudagent.config.js)
- [API Reference](../services/CloudAgentService.js)
- [Environment Variables](./.env.example)

## Support

For issues, questions, or contributions, please refer to the main project documentation.
