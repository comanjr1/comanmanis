/**
 * Batch Task Delegation Example
 * 
 * This example demonstrates batch processing capabilities:
 * - Processing multiple tasks efficiently
 * - Rate limiting and batch sizing
 * - Error handling in batch mode
 * - Ordered vs unordered results
 * - Fail-fast vs continue-on-error
 * 
 * Prerequisites:
 * - Run `npm install` to install dependencies
 * - Configure your .env file with appropriate API keys
 * - Run `node verify-config.js` to verify your setup
 */

require('dotenv').config();
const CloudAgentService = require('../services/CloudAgentService');

/**
 * Example 1: Basic batch processing
 * Process multiple similar tasks efficiently
 */
async function basicBatch() {
  console.log('=== Example 1: Basic Batch Processing ===\n');
  
  const agentService = new CloudAgentService();
  
  // Prepare a batch of tasks
  const tasks = [
    { prompt: 'What is machine learning?' },
    { prompt: 'What is deep learning?' },
    { prompt: 'What is neural network?' },
    { prompt: 'What is natural language processing?' },
    { prompt: 'What is computer vision?' },
  ];
  
  console.log(`Processing ${tasks.length} tasks in batch...\n`);
  
  try {
    const startTime = Date.now();
    
    // Process all tasks in batch
    const results = await agentService.delegateBatch(tasks);
    
    const duration = Date.now() - startTime;
    
    console.log(`Completed in ${duration}ms\n`);
    
    // Display results
    results.forEach((result, index) => {
      console.log(`Task ${index + 1}: ${tasks[index].prompt}`);
      console.log(`Answer: ${result.content.substring(0, 100)}...`);
      console.log('');
    });
    
    console.log(`Successfully processed ${results.length}/${tasks.length} tasks`);
    
  } catch (error) {
    console.error('Batch processing error:', error.message);
  }
}

/**
 * Example 2: Ordered results
 * Ensure results maintain the same order as input tasks
 */
async function orderedBatch() {
  console.log('\n\n=== Example 2: Ordered Batch Results ===\n');
  
  const agentService = new CloudAgentService();
  
  const countries = ['France', 'Japan', 'Brazil', 'Egypt', 'Australia'];
  
  const tasks = countries.map(country => ({
    prompt: `What is the capital of ${country}? Answer with just the city name.`,
    maxTokens: 20,
  }));
  
  console.log('Requesting capitals in order...\n');
  
  try {
    // Use ordered: true to maintain task order in results
    const results = await agentService.delegateBatch(tasks, {
      ordered: true, // Preserve order
    });
    
    // Results are guaranteed to match task order
    countries.forEach((country, index) => {
      console.log(`${country}: ${results[index].content.trim()}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 3: Error handling - fail fast
 * Stop processing on first error
 */
async function failFastBatch() {
  console.log('\n\n=== Example 3: Fail-Fast Batch Processing ===\n');
  
  const agentService = new CloudAgentService();
  
  const tasks = [
    { prompt: 'Task 1: This will succeed' },
    { prompt: 'Task 2: This will also succeed' },
    // This task has an invalid model - will fail
    { prompt: 'Task 3: This will fail', model: 'invalid-model' },
    { prompt: 'Task 4: This will not be processed' },
  ];
  
  console.log('Processing with fail-fast enabled...\n');
  
  try {
    await agentService.delegateBatch(tasks, {
      failFast: true, // Stop on first error
    });
    
  } catch (error) {
    console.error('✓ Batch stopped on error (expected behavior):');
    console.error('  ', error.message);
    console.log('\nWith failFast: true, the batch stops at the first error.');
    console.log('Tasks after the error are not processed.\n');
  }
}

/**
 * Example 4: Continue on error
 * Process all tasks even if some fail
 */
async function continueOnErrorBatch() {
  console.log('\n\n=== Example 4: Continue-on-Error Batch Processing ===\n');
  
  const agentService = new CloudAgentService();
  
  const tasks = [
    { prompt: 'Task 1: What is 2+2?' },
    { prompt: 'Task 2: What is 3+3?' },
    // Invalid task - will fail but processing continues
    { prompt: '', maxTokens: 10 }, // Empty prompt will fail
    { prompt: 'Task 4: What is 5+5?' },
  ];
  
  console.log('Processing with failFast disabled...\n');
  
  try {
    const results = await agentService.delegateBatch(tasks, {
      failFast: false, // Continue even on errors
      ordered: true,
    });
    
    // Check results - some may be errors
    results.forEach((result, index) => {
      if (result.error) {
        console.log(`Task ${index + 1}: ✗ Failed - ${result.error}`);
      } else {
        console.log(`Task ${index + 1}: ✓ ${result.content.substring(0, 50)}...`);
      }
    });
    
    const successful = results.filter(r => !r.error).length;
    console.log(`\n${successful}/${tasks.length} tasks completed successfully`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 5: Large batch processing
 * Handle large batches with automatic chunking
 */
async function largeBatch() {
  console.log('\n\n=== Example 5: Large Batch Processing ===\n');
  
  const agentService = new CloudAgentService();
  
  // Create a large batch of tasks
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
  const tasks = numbers.map(num => ({
    prompt: `What is ${num} squared? Answer with just the number.`,
    maxTokens: 10,
  }));
  
  console.log(`Processing ${tasks.length} tasks...`);
  console.log('(Tasks will be automatically chunked into smaller batches)\n');
  
  try {
    const startTime = Date.now();
    
    const results = await agentService.delegateBatch(tasks, {
      ordered: true,
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`Completed ${results.length} tasks in ${duration}ms`);
    console.log(`Average: ${(duration / results.length).toFixed(2)}ms per task\n`);
    
    // Show a sample of results
    console.log('Sample results:');
    for (let i = 0; i < Math.min(5, results.length); i++) {
      console.log(`  ${i + 1}² = ${results[i].content.trim()}`);
    }
    console.log('  ...');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 6: Data transformation pipeline
 * Use batch processing for data transformation
 */
async function dataTransformationPipeline() {
  console.log('\n\n=== Example 6: Data Transformation Pipeline ===\n');
  
  const agentService = new CloudAgentService();
  
  // Sample data to process
  const products = [
    { name: 'Laptop', price: 999 },
    { name: 'Mouse', price: 25 },
    { name: 'Keyboard', price: 75 },
    { name: 'Monitor', price: 299 },
  ];
  
  // Create tasks to generate marketing descriptions
  const tasks = products.map(product => ({
    prompt: `Write a one-sentence marketing description for a ${product.name} priced at $${product.price}.`,
    maxTokens: 100,
  }));
  
  console.log('Generating marketing descriptions...\n');
  
  try {
    const results = await agentService.delegateBatch(tasks, {
      ordered: true,
    });
    
    // Combine results with original data
    const enrichedProducts = products.map((product, index) => ({
      ...product,
      description: results[index].content.trim(),
    }));
    
    // Display enriched data
    console.log('Enriched Product Catalog:\n');
    enrichedProducts.forEach(product => {
      console.log(`${product.name} - $${product.price}`);
      console.log(`  ${product.description}\n`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 7: Progress tracking
 * Track progress for long-running batch operations
 */
async function withProgressTracking() {
  console.log('\n\n=== Example 7: Batch with Progress Tracking ===\n');
  
  const agentService = new CloudAgentService();
  
  const taskCount = 15;
  const tasks = Array.from({ length: taskCount }, (_, i) => ({
    prompt: `Count from 1 to ${i + 1}`,
    maxTokens: 50,
  }));
  
  console.log(`Processing ${taskCount} tasks with progress tracking...\n`);
  
  let completed = 0;
  const startTime = Date.now();
  
  try {
    // Process in smaller chunks to show progress
    const chunkSize = 5;
    const results = [];
    
    for (let i = 0; i < tasks.length; i += chunkSize) {
      const chunk = tasks.slice(i, i + chunkSize);
      
      const chunkResults = await agentService.delegateBatch(chunk, {
        ordered: true,
      });
      
      results.push(...chunkResults);
      completed += chunkResults.length;
      
      const progress = ((completed / taskCount) * 100).toFixed(1);
      const elapsed = Date.now() - startTime;
      const estimatedTotal = (elapsed / completed) * taskCount;
      const remaining = Math.round((estimatedTotal - elapsed) / 1000);
      
      console.log(`Progress: ${completed}/${taskCount} (${progress}%) - Est. ${remaining}s remaining`);
    }
    
    const totalDuration = Date.now() - startTime;
    console.log(`\n✓ Completed ${taskCount} tasks in ${(totalDuration / 1000).toFixed(2)}s`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('CloudAgentService - Batch Delegation Examples');
  console.log('='.repeat(60));
  console.log();
  
  // Run examples
  await basicBatch();
  await orderedBatch();
  await failFastBatch();
  await continueOnErrorBatch();
  await largeBatch();
  await dataTransformationPipeline();
  await withProgressTracking();
  
  console.log('\n\n' + '='.repeat(60));
  console.log('All batch examples completed!');
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
  basicBatch,
  orderedBatch,
  failFastBatch,
  continueOnErrorBatch,
  largeBatch,
  dataTransformationPipeline,
  withProgressTracking,
};
