/**
 * Simple Task Delegation Example
 * 
 * This example demonstrates the most basic usage of CloudAgentService:
 * - Initializing the service with default configuration
 * - Delegating a single task
 * - Handling the response
 * 
 * Prerequisites:
 * - Run `npm install` to install dependencies
 * - Configure your .env file with appropriate API keys
 * - Run `node verify-config.js` to verify your setup
 */

require('dotenv').config();
const CloudAgentService = require('../services/CloudAgentService');

/**
 * Example 1: Basic task delegation
 * This is the simplest way to use the CloudAgentService
 */
async function basicDelegation() {
  console.log('=== Example 1: Basic Task Delegation ===\n');
  
  // Initialize the service with default configuration from .env
  const agentService = new CloudAgentService();
  
  try {
    // Delegate a simple task
    const result = await agentService.delegateTask({
      prompt: 'What are the three laws of robotics?',
    });
    
    // Display the result
    console.log('Task Response:');
    console.log(result.content);
    console.log(`\nModel used: ${result.model}`);
    
    if (result.usage) {
      console.log(`Tokens: ${JSON.stringify(result.usage)}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify your API key is configured correctly in .env');
    console.error('2. Check your internet connection');
    console.error('3. Ensure you have API quota/credits available');
  }
}

/**
 * Example 2: Custom model selection
 * Override the default model for specific tasks
 */
async function customModelDelegation() {
  console.log('\n\n=== Example 2: Custom Model Selection ===\n');
  
  const agentService = new CloudAgentService();
  
  try {
    // Use a faster/cheaper model for simple tasks
    const result = await agentService.delegateTask({
      prompt: 'Generate a creative name for a coffee shop',
      model: 'gpt-3.5-turbo', // Override default model
      temperature: 0.9, // Higher temperature for more creativity
      maxTokens: 50, // Limit response length
    });
    
    console.log('Coffee shop name suggestion:');
    console.log(result.content);
    console.log(`\nModel: ${result.model}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 3: Multiple sequential tasks
 * Process multiple tasks one after another
 */
async function multipleTasks() {
  console.log('\n\n=== Example 3: Multiple Sequential Tasks ===\n');
  
  const agentService = new CloudAgentService();
  
  // Define multiple tasks
  const tasks = [
    'What is the capital of France?',
    'What is the capital of Japan?',
    'What is the capital of Brazil?',
  ];
  
  console.log('Processing tasks sequentially...\n');
  
  for (let i = 0; i < tasks.length; i++) {
    try {
      console.log(`Task ${i + 1}: ${tasks[i]}`);
      
      const result = await agentService.delegateTask({
        prompt: tasks[i],
        maxTokens: 100,
      });
      
      console.log(`Answer: ${result.content}\n`);
      
    } catch (error) {
      console.error(`Task ${i + 1} failed:`, error.message);
    }
  }
}

/**
 * Example 4: Using service statistics
 * Monitor service usage and performance
 */
async function withStatistics() {
  console.log('\n\n=== Example 4: Service Statistics ===\n');
  
  const agentService = new CloudAgentService();
  
  // Check initial stats
  console.log('Initial stats:', agentService.getStats());
  
  try {
    // Make a request
    console.log('\nMaking a request...');
    await agentService.delegateTask({
      prompt: 'What is artificial intelligence?',
      maxTokens: 100,
    });
    
    // Check stats after request
    console.log('Stats after request:', agentService.getStats());
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 5: Error handling
 * Properly handle different types of errors
 */
async function errorHandling() {
  console.log('\n\n=== Example 5: Error Handling ===\n');
  
  const agentService = new CloudAgentService();
  
  try {
    // This task will succeed
    console.log('Attempting valid task...');
    await agentService.delegateTask({
      prompt: 'Say hello',
      maxTokens: 10,
    });
    console.log('✓ Valid task succeeded\n');
    
  } catch (error) {
    console.error('Valid task failed:', error.message);
  }
  
  try {
    // This will fail due to invalid task structure
    console.log('Attempting invalid task (missing prompt)...');
    await agentService.delegateTask({
      // Missing prompt - should fail validation
      maxTokens: 100,
    });
    
  } catch (error) {
    console.error('✓ Expected error caught:', error.message);
    console.log('   This error is expected - the task has no prompt\n');
  }
  
  try {
    // This will fail if model doesn't exist
    console.log('Attempting invalid model...');
    await agentService.delegateTask({
      prompt: 'Test',
      model: 'non-existent-model',
    });
    
  } catch (error) {
    console.error('✓ Expected error caught:', error.message);
    console.log('   This error is expected - the model doesn\'t exist');
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('CloudAgentService - Simple Delegation Examples');
  console.log('='.repeat(50));
  console.log();
  
  // Run examples one by one
  await basicDelegation();
  await customModelDelegation();
  await multipleTasks();
  await withStatistics();
  await errorHandling();
  
  console.log('\n\n' + '='.repeat(50));
  console.log('All examples completed!');
  console.log('='.repeat(50));
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\nFatal error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  basicDelegation,
  customModelDelegation,
  multipleTasks,
  withStatistics,
  errorHandling,
};
