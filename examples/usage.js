/**
 * Cloud Agent Service - Usage Examples
 * 
 * This file demonstrates various ways to use the CloudAgentService
 */

const CloudAgentService = require('../services/CloudAgentService');

// ==============================================
// Example 1: Basic Single Task Delegation
// ==============================================
async function basicUsageExample() {
  console.log('\n=== Example 1: Basic Task Delegation ===\n');
  
  const agentService = new CloudAgentService();
  
  try {
    const result = await agentService.delegateTask({
      prompt: 'Explain quantum computing in simple terms',
    });
    
    console.log('Response:', result.content);
    console.log('Model used:', result.model);
    console.log('Tokens used:', result.usage);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ==============================================
// Example 2: Custom Model and Parameters
// ==============================================
async function customModelExample() {
  console.log('\n=== Example 2: Custom Model and Parameters ===\n');
  
  const agentService = new CloudAgentService();
  
  try {
    const result = await agentService.delegateTask({
      prompt: 'Write a haiku about programming',
      model: 'gpt-3.5-turbo',
      temperature: 0.9,
      maxTokens: 100,
    });
    
    console.log('Haiku:', result.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ==============================================
// Example 3: Batch Processing
// ==============================================
async function batchProcessingExample() {
  console.log('\n=== Example 3: Batch Processing ===\n');
  
  const agentService = new CloudAgentService();
  
  const tasks = [
    { prompt: 'What is the capital of France?' },
    { prompt: 'What is the capital of Japan?' },
    { prompt: 'What is the capital of Brazil?' },
    { prompt: 'What is the capital of Australia?' },
    { prompt: 'What is the capital of Egypt?' },
  ];
  
  try {
    const results = await agentService.delegateBatch(tasks, {
      failFast: false,
      ordered: true,
    });
    
    results.forEach((result, index) => {
      console.log(`\nTask ${index + 1}:`);
      console.log('Prompt:', tasks[index].prompt);
      console.log('Response:', result.content);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ==============================================
// Example 4: Streaming Response
// ==============================================
async function streamingExample() {
  console.log('\n=== Example 4: Streaming Response ===\n');
  
  const agentService = new CloudAgentService();
  
  try {
    const result = await agentService.delegateTaskStream(
      {
        prompt: 'Tell me a short story about a robot',
      },
      (chunk) => {
        process.stdout.write(chunk.content);
      }
    );
    
    console.log('\n\nFinal result:', result.model);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ==============================================
// Example 5: Custom Configuration
// ==============================================
async function customConfigExample() {
  console.log('\n=== Example 5: Custom Configuration ===\n');
  
  const customConfig = {
    provider: 'openai',
    defaultModel: 'gpt-3.5-turbo',
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
    batch: {
      maxBatchSize: 5,
      batchDelayMs: 200,
    },
    timeout: 30000,
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: 'https://api.openai.com/v1',
        models: {
          'gpt-3.5-turbo': { maxTokens: 2048, temperature: 0.7 },
        },
      },
    },
    logging: {
      enabled: true,
      level: 'debug',
      logRequests: true,
      logResponses: true,
    },
  };
  
  try {
    const agentService = new CloudAgentService(customConfig);
    
    const result = await agentService.delegateTask({
      prompt: 'What is machine learning?',
    });
    
    console.log('Response:', result.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ==============================================
// Example 6: Error Handling and Retries
// ==============================================
async function errorHandlingExample() {
  console.log('\n=== Example 6: Error Handling and Retries ===\n');
  
  const agentService = new CloudAgentService();
  
  try {
    // This will fail if the API key is invalid
    const result = await agentService.delegateTask({
      prompt: 'Test error handling',
    });
    
    console.log('Success:', result.content);
  } catch (error) {
    console.error('Caught error after retries:', error.message);
  }
}

// ==============================================
// Example 7: Service Statistics
// ==============================================
async function statisticsExample() {
  console.log('\n=== Example 7: Service Statistics ===\n');
  
  const agentService = new CloudAgentService();
  
  console.log('Initial stats:', agentService.getStats());
  
  // Make some requests
  const tasks = [
    { prompt: 'Task 1' },
    { prompt: 'Task 2' },
    { prompt: 'Task 3' },
  ];
  
  try {
    await agentService.delegateBatch(tasks);
    console.log('Stats after batch:', agentService.getStats());
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ==============================================
// Example 8: Different Provider Usage
// ==============================================
async function multiProviderExample() {
  console.log('\n=== Example 8: Using Different Providers ===\n');
  
  // OpenAI
  if (process.env.OPENAI_API_KEY) {
    console.log('\nUsing OpenAI:');
    const openaiService = new CloudAgentService({
      provider: 'openai',
      defaultModel: 'gpt-3.5-turbo',
      providers: {
        openai: {
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: 'https://api.openai.com/v1',
          models: {
            'gpt-3.5-turbo': { maxTokens: 2048, temperature: 0.7 },
          },
        },
      },
      rateLimit: { maxRequestsPerMinute: 60, maxConcurrent: 5 },
      retry: { maxRetries: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
      batch: { maxBatchSize: 10, batchDelayMs: 100 },
      timeout: 60000,
      logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
    });
    
    try {
      const result = await openaiService.delegateTask({
        prompt: 'Say hello from OpenAI',
      });
      console.log('OpenAI response:', result.content);
    } catch (error) {
      console.error('OpenAI error:', error.message);
    }
  }
  
  // Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    console.log('\nUsing Anthropic:');
    const anthropicService = new CloudAgentService({
      provider: 'anthropic',
      defaultModel: 'claude-3-haiku',
      providers: {
        anthropic: {
          apiKey: process.env.ANTHROPIC_API_KEY,
          baseURL: 'https://api.anthropic.com/v1',
          models: {
            'claude-3-haiku': { maxTokens: 4096, temperature: 0.7 },
          },
        },
      },
      rateLimit: { maxRequestsPerMinute: 60, maxConcurrent: 5 },
      retry: { maxRetries: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
      batch: { maxBatchSize: 10, batchDelayMs: 100 },
      timeout: 60000,
      logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
    });
    
    try {
      const result = await anthropicService.delegateTask({
        prompt: 'Say hello from Anthropic',
      });
      console.log('Anthropic response:', result.content);
    } catch (error) {
      console.error('Anthropic error:', error.message);
    }
  }
}

// ==============================================
// Run Examples
// ==============================================
async function runExamples() {
  console.log('Cloud Agent Service - Usage Examples');
  console.log('=====================================');
  
  // Uncomment the examples you want to run
  
  // await basicUsageExample();
  // await customModelExample();
  // await batchProcessingExample();
  // await streamingExample();
  // await customConfigExample();
  // await errorHandlingExample();
  // await statisticsExample();
  // await multiProviderExample();
  
  console.log('\n\nExamples completed!');
  console.log('Note: Most examples are commented out by default.');
  console.log('Uncomment them in the code to run specific examples.');
}

// Run if executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

module.exports = {
  basicUsageExample,
  customModelExample,
  batchProcessingExample,
  streamingExample,
  customConfigExample,
  errorHandlingExample,
  statisticsExample,
  multiProviderExample,
};
