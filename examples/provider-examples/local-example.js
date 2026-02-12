/**
 * Local Agent Provider Example
 * 
 * This example demonstrates CloudAgentService with local/self-hosted agents:
 * - Custom local AI models (e.g., Ollama, LocalAI, vLLM)
 * - Self-hosted agent services
 * - On-premise deployments
 * - Custom API endpoints
 * 
 * Prerequisites:
 * - Set up a local agent server (e.g., Ollama, LocalAI)
 * - Set LOCAL_AGENT_ENDPOINT in your .env file
 * - Optionally set LOCAL_AGENT_API_KEY if your server requires authentication
 * - Run `node verify-config.js` to verify setup
 */

require('dotenv').config();
const CloudAgentService = require('../../services/CloudAgentService');

/**
 * Example 1: Basic local agent usage
 */
async function basicLocalAgent() {
  console.log('=== Example 1: Basic Local Agent Usage ===\n');
  
  const customConfig = {
    provider: 'local',
    defaultModel: 'default',
    providers: {
      local: {
        endpoint: process.env.LOCAL_AGENT_ENDPOINT || 'http://localhost:8000',
        apiKey: process.env.LOCAL_AGENT_API_KEY,
        models: {
          'default': { maxTokens: 4096, temperature: 0.7 },
        },
      },
    },
    rateLimit: { maxRequestsPerMinute: 100, maxConcurrent: 10 },
    retry: { maxRetries: 2, initialDelay: 500, maxDelay: 5000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 20, batchDelayMs: 50 },
    timeout: 30000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  try {
    console.log(`Connecting to local agent at: ${customConfig.providers.local.endpoint}\n`);
    
    const result = await agentService.delegateTask({
      prompt: 'What are the advantages of using local AI models?',
      maxTokens: 300,
    });
    
    console.log('Local Agent Response:');
    console.log(result.content);
    console.log(`\nModel: ${result.model}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('- Ensure your local agent server is running');
    console.error('- Check that LOCAL_AGENT_ENDPOINT is correct in .env');
    console.error('- Verify the endpoint is accessible (try curl or browser)');
    console.error('- Check if authentication is required and LOCAL_AGENT_API_KEY is set');
  }
}

/**
 * Example 2: Ollama integration
 * Example configuration for using Ollama as a local provider
 */
async function ollamaExample() {
  console.log('\n\n=== Example 2: Ollama Integration ===\n');
  
  // Ollama typically runs on port 11434
  const customConfig = {
    provider: 'local',
    defaultModel: 'llama2', // or 'mistral', 'codellama', etc.
    providers: {
      local: {
        endpoint: process.env.LOCAL_AGENT_ENDPOINT || 'http://localhost:11434',
        // Ollama doesn't require API key
        models: {
          'llama2': { maxTokens: 4096, temperature: 0.7 },
          'mistral': { maxTokens: 8192, temperature: 0.7 },
          'codellama': { maxTokens: 4096, temperature: 0.5 },
        },
      },
    },
    rateLimit: { maxRequestsPerMinute: 100, maxConcurrent: 5 },
    retry: { maxRetries: 2, initialDelay: 500, maxDelay: 5000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 10, batchDelayMs: 50 },
    timeout: 60000, // Local models may take longer
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  console.log('Using Ollama with llama2 model...\n');
  console.log('Note: This example assumes Ollama is installed and running locally.');
  console.log('Install Ollama from: https://ollama.ai\n');
  
  try {
    const result = await agentService.delegateTask({
      prompt: 'Explain the benefits of running AI models locally.',
      model: 'llama2',
      maxTokens: 200,
    });
    
    console.log('Ollama Response:');
    console.log(result.content);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nTo use Ollama:');
    console.error('1. Install Ollama: https://ollama.ai');
    console.error('2. Run: ollama pull llama2');
    console.error('3. Run: ollama serve');
  }
}

/**
 * Example 3: High-throughput batch processing
 * Local agents typically have higher rate limits
 */
async function highThroughputBatch() {
  console.log('\n\n=== Example 3: High-Throughput Batch Processing ===\n');
  
  const customConfig = {
    provider: 'local',
    defaultModel: 'default',
    providers: {
      local: {
        endpoint: process.env.LOCAL_AGENT_ENDPOINT || 'http://localhost:8000',
        apiKey: process.env.LOCAL_AGENT_API_KEY,
        models: {
          'default': { maxTokens: 2048, temperature: 0.7 },
        },
      },
    },
    // Local agents can handle higher concurrency
    rateLimit: { maxRequestsPerMinute: 200, maxConcurrent: 20 },
    retry: { maxRetries: 2, initialDelay: 500, maxDelay: 5000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 50, batchDelayMs: 10 },
    timeout: 30000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  // Generate a large batch of simple tasks
  const taskCount = 50;
  const tasks = Array.from({ length: taskCount }, (_, i) => ({
    prompt: `Generate a creative name for product #${i + 1}`,
    maxTokens: 30,
  }));
  
  console.log(`Processing ${taskCount} tasks with local agent...\n`);
  
  try {
    const startTime = Date.now();
    
    const results = await agentService.delegateBatch(tasks, {
      ordered: true,
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`Completed ${results.length} tasks in ${duration}ms`);
    console.log(`Throughput: ${(results.length / (duration / 1000)).toFixed(2)} tasks/second`);
    console.log(`Average: ${(duration / results.length).toFixed(2)}ms per task\n`);
    
    // Show sample results
    console.log('Sample results:');
    for (let i = 0; i < Math.min(5, results.length); i++) {
      console.log(`  ${i + 1}. ${results[i].content.substring(0, 50)}...`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 4: Cost-free unlimited usage
 * Local agents don't have API costs or quota limits
 */
async function unlimitedUsage() {
  console.log('\n\n=== Example 4: Cost-Free Unlimited Usage ===\n');
  
  const customConfig = {
    provider: 'local',
    defaultModel: 'default',
    providers: {
      local: {
        endpoint: process.env.LOCAL_AGENT_ENDPOINT || 'http://localhost:8000',
        apiKey: process.env.LOCAL_AGENT_API_KEY,
        models: {
          'default': { maxTokens: 2048, temperature: 0.7 },
        },
      },
    },
    rateLimit: { maxRequestsPerMinute: 1000, maxConcurrent: 50 },
    retry: { maxRetries: 2, initialDelay: 500, maxDelay: 5000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 100, batchDelayMs: 10 },
    timeout: 30000,
    logging: { enabled: false, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  console.log('Demonstrating unlimited usage with local agent...');
  console.log('No API costs, no quota limits!\n');
  
  const iterations = 10;
  
  try {
    for (let i = 0; i < iterations; i++) {
      await agentService.delegateTask({
        prompt: `Generate a random fact #${i + 1}`,
        maxTokens: 100,
      });
      
      process.stdout.write(`Progress: ${i + 1}/${iterations}\r`);
    }
    
    console.log(`\n\n✓ Completed ${iterations} requests with zero API costs!`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 5: Privacy-focused processing
 * Local agents keep data on-premise
 */
async function privacyFocused() {
  console.log('\n\n=== Example 5: Privacy-Focused Processing ===\n');
  
  const customConfig = {
    provider: 'local',
    defaultModel: 'default',
    providers: {
      local: {
        endpoint: process.env.LOCAL_AGENT_ENDPOINT || 'http://localhost:8000',
        apiKey: process.env.LOCAL_AGENT_API_KEY,
        models: {
          'default': { maxTokens: 2048, temperature: 0.5 },
        },
      },
    },
    rateLimit: { maxRequestsPerMinute: 100, maxConcurrent: 10 },
    retry: { maxRetries: 2, initialDelay: 500, maxDelay: 5000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 20, batchDelayMs: 50 },
    timeout: 30000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  // Simulate processing sensitive data
  const sensitiveData = {
    customerName: 'John Doe',
    email: 'john.doe@example.com',
    orderValue: '$1,234.56',
  };
  
  console.log('Processing sensitive customer data locally...');
  console.log('Data never leaves your infrastructure!\n');
  
  try {
    const result = await agentService.delegateTask({
      prompt: `Generate a personalized thank you message for a customer.
               Customer: ${sensitiveData.customerName}
               Order value: ${sensitiveData.orderValue}
               Keep it professional and warm.`,
      maxTokens: 150,
    });
    
    console.log('Generated Message:');
    console.log(result.content);
    console.log('\n✓ All data processed locally - privacy maintained!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 6: Custom model switching
 * Switch between different local models based on task
 */
async function customModelSwitching() {
  console.log('\n\n=== Example 6: Custom Model Switching ===\n');
  
  const customConfig = {
    provider: 'local',
    defaultModel: 'general',
    providers: {
      local: {
        endpoint: process.env.LOCAL_AGENT_ENDPOINT || 'http://localhost:8000',
        apiKey: process.env.LOCAL_AGENT_API_KEY,
        models: {
          'general': { maxTokens: 2048, temperature: 0.7 },
          'code': { maxTokens: 4096, temperature: 0.3 },
          'creative': { maxTokens: 2048, temperature: 0.9 },
        },
      },
    },
    rateLimit: { maxRequestsPerMinute: 100, maxConcurrent: 10 },
    retry: { maxRetries: 2, initialDelay: 500, maxDelay: 5000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 20, batchDelayMs: 50 },
    timeout: 30000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  console.log('Using different models for different task types...\n');
  
  try {
    // General knowledge task
    console.log('General model - Factual question:');
    const general = await agentService.delegateTask({
      prompt: 'What is photosynthesis?',
      model: 'general',
      maxTokens: 150,
    });
    console.log(general.content);
    
    // Code generation task
    console.log('\n\nCode model - Programming task:');
    const code = await agentService.delegateTask({
      prompt: 'Write a Python function to reverse a string',
      model: 'code',
      maxTokens: 200,
    });
    console.log(code.content);
    
    // Creative writing task
    console.log('\n\nCreative model - Story writing:');
    const creative = await agentService.delegateTask({
      prompt: 'Write an opening line for a mystery novel',
      model: 'creative',
      maxTokens: 100,
    });
    console.log(creative.content);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 7: Comparing cloud vs local performance
 */
async function performanceComparison() {
  console.log('\n\n=== Example 7: Performance Insights ===\n');
  
  const customConfig = {
    provider: 'local',
    defaultModel: 'default',
    providers: {
      local: {
        endpoint: process.env.LOCAL_AGENT_ENDPOINT || 'http://localhost:8000',
        apiKey: process.env.LOCAL_AGENT_API_KEY,
        models: {
          'default': { maxTokens: 2048, temperature: 0.7 },
        },
      },
    },
    rateLimit: { maxRequestsPerMinute: 100, maxConcurrent: 10 },
    retry: { maxRetries: 2, initialDelay: 500, maxDelay: 5000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 20, batchDelayMs: 50 },
    timeout: 30000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  console.log('Local Agent Advantages:');
  console.log('✓ No API costs - unlimited usage');
  console.log('✓ Data privacy - stays on-premise');
  console.log('✓ No internet required - works offline');
  console.log('✓ Customizable - use any model');
  console.log('✓ High concurrency - no rate limits\n');
  
  console.log('Considerations:');
  console.log('• Requires local infrastructure');
  console.log('• Model quality varies');
  console.log('• Hardware requirements');
  console.log('• Setup and maintenance overhead\n');
  
  try {
    const stats = agentService.getStats();
    console.log('Current stats:', stats);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('Local Agent Provider Examples');
  console.log('=' .repeat(60));
  console.log();
  
  console.log('NOTE: These examples require a local agent server to be running.');
  console.log('Common options: Ollama, LocalAI, vLLM, or custom implementations.\n');
  
  // Run examples
  await basicLocalAgent();
  await ollamaExample();
  await highThroughputBatch();
  await unlimitedUsage();
  await privacyFocused();
  await customModelSwitching();
  await performanceComparison();
  
  console.log('\n\n' + '='.repeat(60));
  console.log('All local agent examples completed!');
  console.log('=' .repeat(60));
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\nFatal error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  basicLocalAgent,
  ollamaExample,
  highThroughputBatch,
  unlimitedUsage,
  privacyFocused,
  customModelSwitching,
  performanceComparison,
};
