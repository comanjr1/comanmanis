# Quick Start Guide

Get up and running with CloudAgentService in minutes. This guide will walk you through the essential steps to start delegating tasks to cloud-based AI agents.

## Prerequisites

Before you begin, ensure you have:

- **Node.js**: Version 14.x or higher
- **npm**: Usually comes with Node.js
- **API Keys**: At least one provider API key (OpenAI, Anthropic, Google AI, or a local agent endpoint)
- **Terminal Access**: Command-line interface to run commands

### Optional Prerequisites

- **Git**: For cloning the repository
- **Code Editor**: VS Code, Sublime Text, or your preferred editor
- **curl**: For testing provider endpoints

## Step-by-Step Setup

### Step 1: Clone or Download the Repository

```bash
git clone <repository-url>
cd comanmanis
```

Or download and extract the ZIP file to your local machine.

### Step 2: Install Dependencies

```bash
npm install
```

This installs the required packages (currently minimal, mainly `dotenv` for environment management).

### Step 3: Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your API key(s). **You only need one provider configured to get started:**

#### Option A: OpenAI (Recommended for beginners)

```bash
CLOUD_AGENT_PROVIDER=openai
OPENAI_API_KEY=sk-your-api-key-here
CLOUD_AGENT_DEFAULT_MODEL=gpt-3.5-turbo  # Cheaper for testing
```

#### Option B: Anthropic

```bash
CLOUD_AGENT_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
CLOUD_AGENT_DEFAULT_MODEL=claude-3-haiku  # Faster for testing
```

#### Option C: Google AI

```bash
CLOUD_AGENT_PROVIDER=google
GOOGLE_AI_API_KEY=your-api-key-here
CLOUD_AGENT_DEFAULT_MODEL=gemini-pro
```

#### Option D: Local Agent (Free!)

```bash
CLOUD_AGENT_PROVIDER=local
LOCAL_AGENT_ENDPOINT=http://localhost:11434  # e.g., Ollama
CLOUD_AGENT_DEFAULT_MODEL=default
```

### Step 4: Verify Your Configuration

Run the verification script to ensure everything is set up correctly:

```bash
node verify-config.js
```

You should see:

```
✅ Configuration is valid!
✅ Provider configured: openai
✅ API key configured for: openai
```

If you see any errors, double-check your `.env` file and API keys.

### Step 5: Run Your First Task

Create a simple test file `test.js`:

```javascript
const CloudAgentService = require('./services/CloudAgentService');

async function firstTask() {
  try {
    // Initialize the service
    const agentService = new CloudAgentService();
    
    // Delegate your first task
    const result = await agentService.delegateTask({
      prompt: 'Explain what a cloud agent is in one sentence.',
    });
    
    console.log('Response:', result.content);
    console.log('Model used:', result.model);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

firstTask();
```

Run it:

```bash
node test.js
```

**Expected output:**
```
Response: A cloud agent is an AI-powered service that processes tasks and requests remotely, leveraging cloud infrastructure to provide intelligent responses and automation.
Model used: gpt-3.5-turbo
```

🎉 **Congratulations!** You've successfully delegated your first task to a cloud agent!

## Common Use Cases

Now that you have the basics working, try these common scenarios:

### Use Case 1: Ask Questions

```javascript
const CloudAgentService = require('./services/CloudAgentService');

async function askQuestion() {
  const agentService = new CloudAgentService();
  
  const result = await agentService.delegateTask({
    prompt: 'What are the three laws of robotics?',
  });
  
  console.log(result.content);
}

askQuestion();
```

### Use Case 2: Generate Code

```javascript
const CloudAgentService = require('./services/CloudAgentService');

async function generateCode() {
  const agentService = new CloudAgentService();
  
  const result = await agentService.delegateTask({
    prompt: 'Write a JavaScript function to reverse a string',
    temperature: 0.3,  // Lower temperature for more focused output
  });
  
  console.log(result.content);
}

generateCode();
```

### Use Case 3: Process Multiple Tasks

```javascript
const CloudAgentService = require('./services/CloudAgentService');

async function processBatch() {
  const agentService = new CloudAgentService();
  
  const tasks = [
    { prompt: 'Translate "hello" to Spanish' },
    { prompt: 'Translate "goodbye" to French' },
    { prompt: 'Translate "thank you" to German' },
  ];
  
  const results = await agentService.delegateBatch(tasks);
  
  results.forEach((result, i) => {
    console.log(`Task ${i + 1}: ${result.content}`);
  });
}

processBatch();
```

### Use Case 4: Stream Long Responses

```javascript
const CloudAgentService = require('./services/CloudAgentService');

async function streamResponse() {
  const agentService = new CloudAgentService();
  
  await agentService.delegateTaskStream(
    { prompt: 'Write a short story about AI' },
    (chunk) => {
      // Display content as it arrives
      process.stdout.write(chunk.content);
    }
  );
  
  console.log('\n\nDone!');
}

streamResponse();
```

### Use Case 5: Data Transformation

```javascript
const CloudAgentService = require('./services/CloudAgentService');

async function transformData() {
  const agentService = new CloudAgentService();
  
  const rawData = [
    'Apple, red, fruit',
    'Carrot, orange, vegetable',
    'Banana, yellow, fruit',
  ];
  
  const tasks = rawData.map(item => ({
    prompt: `Convert this CSV data to JSON: ${item}`,
  }));
  
  const results = await agentService.delegateBatch(tasks);
  
  results.forEach(result => {
    console.log(result.content);
  });
}

transformData();
```

## Troubleshooting Tips

### Problem: "Invalid configuration" Error

**Symptoms:**
```
Error: Invalid configuration: API key not configured for provider: openai
```

**Solution:**
1. Check that your `.env` file exists in the project root
2. Verify the API key is correctly set (no extra spaces)
3. Ensure you've set the correct provider name
4. Run `node verify-config.js` to diagnose

### Problem: "Request timeout" Error

**Symptoms:**
```
Error: Request timeout after 60000ms
```

**Solution:**
```bash
# Increase timeout in .env
CLOUD_AGENT_TIMEOUT=120000  # 2 minutes
```

Or in code:
```javascript
const service = new CloudAgentService({
  timeout: 120000,
});
```

### Problem: Rate Limit Errors

**Symptoms:**
```
Error: Rate limit exceeded
```

**Solution:**
```bash
# Reduce concurrent requests in .env
CLOUD_AGENT_MAX_CONCURRENT=2
CLOUD_AGENT_RATE_LIMIT=20
```

The service will automatically queue requests when limits are reached.

### Problem: "Model not found" Error

**Symptoms:**
```
Error: Model 'gpt-5' not found
```

**Solution:**
- Check the model name spelling
- Verify you have access to the model (e.g., GPT-4 requires special access)
- Use default models: `gpt-3.5-turbo`, `claude-3-haiku`, `gemini-pro`

### Problem: API Key Invalid

**Symptoms:**
```
Error: Invalid API key
```

**Solution:**
1. Verify the API key is correct (copy-paste from provider dashboard)
2. Check if the key has expired
3. Ensure you have credits/quota available
4. Test the key directly with the provider's API

### Problem: Connection Issues

**Symptoms:**
```
Error: ECONNREFUSED or Network error
```

**Solution:**
1. Check your internet connection
2. Verify the provider's API is accessible
3. Check if you're behind a proxy/firewall
4. Try a different provider

### Problem: Out of Credits

**Symptoms:**
```
Error: Insufficient quota
```

**Solution:**
- Check your account balance with the provider
- Add credits to your account
- Switch to a different provider temporarily
- Use a local provider (free!)

## Configuration Quick Reference

### Essential Environment Variables

```bash
# Provider selection (required)
CLOUD_AGENT_PROVIDER=openai

# API Keys (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
LOCAL_AGENT_ENDPOINT=http://localhost:8000

# Model selection (optional, has defaults)
CLOUD_AGENT_DEFAULT_MODEL=gpt-3.5-turbo

# Rate limiting (optional, has defaults)
CLOUD_AGENT_RATE_LIMIT=60
CLOUD_AGENT_MAX_CONCURRENT=5

# Timeout (optional, default 60s)
CLOUD_AGENT_TIMEOUT=60000
```

### Configuration Presets

#### Development/Testing (Fast & Cheap)
```bash
CLOUD_AGENT_PROVIDER=openai
CLOUD_AGENT_DEFAULT_MODEL=gpt-3.5-turbo
CLOUD_AGENT_MAX_CONCURRENT=10
CLOUD_AGENT_TIMEOUT=30000
```

#### Production (Balanced)
```bash
CLOUD_AGENT_PROVIDER=openai
CLOUD_AGENT_DEFAULT_MODEL=gpt-4
CLOUD_AGENT_RATE_LIMIT=60
CLOUD_AGENT_MAX_CONCURRENT=5
CLOUD_AGENT_MAX_RETRIES=3
CLOUD_AGENT_TIMEOUT=60000
```

#### High-Quality Output
```bash
CLOUD_AGENT_PROVIDER=anthropic
CLOUD_AGENT_DEFAULT_MODEL=claude-3-opus
CLOUD_AGENT_MAX_CONCURRENT=3
CLOUD_AGENT_TIMEOUT=120000
```

#### Local/Free (Unlimited)
```bash
CLOUD_AGENT_PROVIDER=local
LOCAL_AGENT_ENDPOINT=http://localhost:11434
CLOUD_AGENT_MAX_CONCURRENT=20
```

## Next Steps

Now that you have CloudAgentService running, explore these resources:

### 1. Run the Examples

```bash
# Simple delegation
npm run example:simple

# Batch processing
npm run example:batch

# Provider-specific examples
npm run example:openai
npm run example:anthropic
npm run example:google
npm run example:local
```

### 2. Read the Documentation

- **[API Reference](./API.md)**: Detailed API documentation
- **[Architecture Guide](./ARCHITECTURE.md)**: Understand the system design
- **[Implementation Guide](./IMPLEMENTATION.md)**: Deep dive into implementation details

### 3. Explore Advanced Features

- **Streaming Responses**: Real-time output for long tasks
- **Batch Processing**: Efficient processing of multiple tasks
- **Custom Models**: Use specific models for different tasks
- **Rate Limit Tuning**: Optimize for your use case
- **Error Handling**: Robust error handling patterns
- **Service Statistics**: Monitor performance

### 4. Integration Examples

```javascript
// Express.js API endpoint
app.post('/api/ask', async (req, res) => {
  const agentService = new CloudAgentService();
  const result = await agentService.delegateTask({
    prompt: req.body.question,
  });
  res.json({ answer: result.content });
});

// CLI tool
const readline = require('readline');
const agentService = new CloudAgentService();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('line', async (input) => {
  const result = await agentService.delegateTask({
    prompt: input,
  });
  console.log(result.content);
});
```

### 5. Best Practices

- **Always handle errors**: Wrap calls in try-catch blocks
- **Monitor usage**: Use `getStats()` to track service health
- **Batch similar tasks**: More efficient than individual calls
- **Choose appropriate models**: Balance cost vs. capability
- **Set reasonable timeouts**: Based on expected task duration
- **Secure your API keys**: Never commit `.env` to version control
- **Test with cheap models first**: Use `gpt-3.5-turbo` or `claude-3-haiku`
- **Use local providers for development**: Free and fast

## Getting Help

If you encounter issues:

1. **Check the logs**: Enable debug logging
   ```bash
   CLOUD_AGENT_LOG_LEVEL=debug
   ```

2. **Run verification**: 
   ```bash
   node verify-config.js
   ```

3. **Review examples**: Check `examples/` directory for working code

4. **Read the docs**: See full documentation in `docs/`

5. **Check provider status**: Verify the API provider is operational

## Quick Tips

💡 **Tip 1**: Start with `gpt-3.5-turbo` - it's fast and cheap for testing

💡 **Tip 2**: Use local providers (like Ollama) for unlimited free testing

💡 **Tip 3**: Enable request logging during development:
```bash
CLOUD_AGENT_LOG_REQUESTS=true
CLOUD_AGENT_LOG_RESPONSES=true
```

💡 **Tip 4**: For production, implement proper error handling:
```javascript
try {
  const result = await service.delegateTask(task);
} catch (error) {
  console.error('Task failed:', error.message);
  // Implement fallback or retry logic
}
```

💡 **Tip 5**: Monitor your API usage to avoid unexpected costs:
```javascript
const stats = service.getStats();
console.log('Active requests:', stats.activeRequests);
```

## Summary

You've learned how to:
- ✅ Install and configure CloudAgentService
- ✅ Verify your setup
- ✅ Execute your first task
- ✅ Handle common use cases
- ✅ Troubleshoot issues
- ✅ Configure for different environments

Happy delegating! 🚀
