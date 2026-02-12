/**
 * OpenAI Provider Example
 * 
 * This example demonstrates CloudAgentService with OpenAI's GPT models:
 * - GPT-4 for complex reasoning tasks
 * - GPT-3.5-turbo for faster, cost-effective tasks
 * - Custom parameters and configurations
 * - OpenAI-specific features
 * 
 * Prerequisites:
 * - Set OPENAI_API_KEY in your .env file
 * - Optionally set OPENAI_ORGANIZATION if using an organization account
 * - Run `node verify-config.js` to verify setup
 */

require('dotenv').config();
const CloudAgentService = require('../../services/CloudAgentService');

/**
 * Example 1: Using GPT-4 for complex reasoning
 */
async function gpt4ComplexReasoning() {
  console.log('=== Example 1: GPT-4 Complex Reasoning ===\n');
  
  // Configure service for OpenAI with GPT-4
  const customConfig = {
    provider: 'openai',
    defaultModel: 'gpt-4',
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORGANIZATION,
        baseURL: 'https://api.openai.com/v1',
        models: {
          'gpt-4': { maxTokens: 8192, temperature: 0.7 },
        },
      },
    },
    rateLimit: { maxRequestsPerMinute: 60, maxConcurrent: 5 },
    retry: { maxRetries: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 10, batchDelayMs: 100 },
    timeout: 60000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  try {
    const result = await agentService.delegateTask({
      prompt: `Explain the concept of quantum entanglement and its implications for quantum computing. 
               Keep the explanation accessible to someone with basic physics knowledge.`,
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 500,
    });
    
    console.log('GPT-4 Response:');
    console.log(result.content);
    console.log(`\nModel: ${result.model}`);
    console.log(`Tokens used: ${JSON.stringify(result.usage)}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('- Ensure OPENAI_API_KEY is set in .env');
    console.error('- Check if you have GPT-4 API access');
    console.error('- Verify your OpenAI account has sufficient credits');
  }
}

/**
 * Example 2: Using GPT-3.5-turbo for fast responses
 */
async function gpt35FastTasks() {
  console.log('\n\n=== Example 2: GPT-3.5-turbo Fast Tasks ===\n');
  
  const customConfig = {
    provider: 'openai',
    defaultModel: 'gpt-3.5-turbo',
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: 'https://api.openai.com/v1',
        models: {
          'gpt-3.5-turbo': { maxTokens: 4096, temperature: 0.7 },
        },
      },
    },
    rateLimit: { maxRequestsPerMinute: 60, maxConcurrent: 5 },
    retry: { maxRetries: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 10, batchDelayMs: 100 },
    timeout: 60000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  console.log('Processing quick tasks with GPT-3.5-turbo...\n');
  
  const tasks = [
    'Translate "Hello, how are you?" to Spanish',
    'What is 15% of 200?',
    'Give me a synonym for "happy"',
    'What is the chemical symbol for gold?',
  ];
  
  try {
    const startTime = Date.now();
    
    for (const task of tasks) {
      const result = await agentService.delegateTask({
        prompt: task,
        maxTokens: 50,
      });
      
      console.log(`Q: ${task}`);
      console.log(`A: ${result.content}\n`);
    }
    
    const duration = Date.now() - startTime;
    console.log(`Completed ${tasks.length} tasks in ${duration}ms`);
    console.log(`Average: ${(duration / tasks.length).toFixed(2)}ms per task`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 3: Temperature control for creativity
 */
async function temperatureControl() {
  console.log('\n\n=== Example 3: Temperature Control ===\n');
  
  const customConfig = {
    provider: 'openai',
    defaultModel: 'gpt-3.5-turbo',
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: 'https://api.openai.com/v1',
        models: {
          'gpt-3.5-turbo': { maxTokens: 4096, temperature: 0.7 },
        },
      },
    },
    rateLimit: { maxRequestsPerMinute: 60, maxConcurrent: 5 },
    retry: { maxRetries: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 10, batchDelayMs: 100 },
    timeout: 60000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  const prompt = 'Write a creative opening line for a science fiction story.';
  
  console.log('Comparing responses at different temperatures:\n');
  
  try {
    // Low temperature (0.2) - more focused and deterministic
    console.log('Low temperature (0.2) - More focused:');
    const lowTemp = await agentService.delegateTask({
      prompt,
      temperature: 0.2,
      maxTokens: 100,
    });
    console.log(lowTemp.content);
    
    console.log('\nMedium temperature (0.7) - Balanced:');
    const medTemp = await agentService.delegateTask({
      prompt,
      temperature: 0.7,
      maxTokens: 100,
    });
    console.log(medTemp.content);
    
    console.log('\nHigh temperature (1.0) - More creative:');
    const highTemp = await agentService.delegateTask({
      prompt,
      temperature: 1.0,
      maxTokens: 100,
    });
    console.log(highTemp.content);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 4: Code generation with GPT
 */
async function codeGeneration() {
  console.log('\n\n=== Example 4: Code Generation ===\n');
  
  const customConfig = {
    provider: 'openai',
    defaultModel: 'gpt-4',
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: 'https://api.openai.com/v1',
        models: {
          'gpt-4': { maxTokens: 8192, temperature: 0.2 },
        },
      },
    },
    rateLimit: { maxRequestsPerMinute: 60, maxConcurrent: 5 },
    retry: { maxRetries: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 10, batchDelayMs: 100 },
    timeout: 60000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  try {
    const result = await agentService.delegateTask({
      prompt: `Write a Python function that calculates the Fibonacci sequence up to n terms.
               Include docstring and handle edge cases.`,
      temperature: 0.2, // Lower temperature for more precise code
      maxTokens: 500,
    });
    
    console.log('Generated Code:');
    console.log(result.content);
    console.log(`\nTokens used: ${JSON.stringify(result.usage)}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 5: Batch processing with different models
 */
async function batchWithModelSelection() {
  console.log('\n\n=== Example 5: Batch Processing with Model Selection ===\n');
  
  const customConfig = {
    provider: 'openai',
    defaultModel: 'gpt-3.5-turbo',
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: 'https://api.openai.com/v1',
        models: {
          'gpt-4': { maxTokens: 8192, temperature: 0.7 },
          'gpt-3.5-turbo': { maxTokens: 4096, temperature: 0.7 },
        },
      },
    },
    rateLimit: { maxRequestsPerMinute: 60, maxConcurrent: 3 },
    retry: { maxRetries: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 5, batchDelayMs: 100 },
    timeout: 60000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  // Mix of simple and complex tasks with appropriate models
  const tasks = [
    // Simple tasks - use GPT-3.5-turbo
    { prompt: 'What is 25 * 4?', model: 'gpt-3.5-turbo', maxTokens: 20 },
    { prompt: 'Capital of Italy?', model: 'gpt-3.5-turbo', maxTokens: 20 },
    
    // Complex tasks - use GPT-4
    { 
      prompt: 'Explain the difference between supervised and unsupervised learning', 
      model: 'gpt-4', 
      maxTokens: 200 
    },
    { 
      prompt: 'What are the key principles of object-oriented programming?', 
      model: 'gpt-4', 
      maxTokens: 200 
    },
  ];
  
  console.log('Processing mixed batch with model selection...\n');
  
  try {
    const results = await agentService.delegateBatch(tasks, {
      ordered: true,
    });
    
    results.forEach((result, index) => {
      console.log(`Task ${index + 1} (${tasks[index].model}):`);
      console.log(result.content.substring(0, 150) + (result.content.length > 150 ? '...' : ''));
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 6: Streaming responses (simplified demonstration)
 */
async function streamingResponse() {
  console.log('\n\n=== Example 6: Streaming Response ===\n');
  
  const customConfig = {
    provider: 'openai',
    defaultModel: 'gpt-3.5-turbo',
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: 'https://api.openai.com/v1',
        models: {
          'gpt-3.5-turbo': { maxTokens: 4096, temperature: 0.7 },
        },
      },
    },
    rateLimit: { maxRequestsPerMinute: 60, maxConcurrent: 5 },
    retry: { maxRetries: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 10, batchDelayMs: 100 },
    timeout: 60000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  console.log('Requesting streaming response...\n');
  
  try {
    await agentService.delegateTaskStream(
      {
        prompt: 'Write a short paragraph about the future of AI',
        maxTokens: 200,
      },
      (chunk) => {
        // Process each chunk as it arrives
        process.stdout.write(chunk.content);
      }
    );
    
    console.log('\n\nStream completed!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('OpenAI Provider Examples');
  console.log('=' .repeat(60));
  console.log();
  
  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY not found in environment variables');
    console.error('Please set it in your .env file');
    process.exit(1);
  }
  
  // Run examples
  await gpt4ComplexReasoning();
  await gpt35FastTasks();
  await temperatureControl();
  await codeGeneration();
  await batchWithModelSelection();
  await streamingResponse();
  
  console.log('\n\n' + '='.repeat(60));
  console.log('All OpenAI examples completed!');
  console.log('='.repeat(60));
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\nFatal error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  gpt4ComplexReasoning,
  gpt35FastTasks,
  temperatureControl,
  codeGeneration,
  batchWithModelSelection,
  streamingResponse,
};
