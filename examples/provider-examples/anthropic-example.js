/**
 * Anthropic (Claude) Provider Example
 * 
 * This example demonstrates CloudAgentService with Anthropic's Claude models:
 * - Claude 3 Opus for most capable tasks
 * - Claude 3 Sonnet for balanced performance
 * - Claude 3 Haiku for fast, cost-effective tasks
 * - Anthropic-specific features and best practices
 * 
 * Prerequisites:
 * - Set ANTHROPIC_API_KEY in your .env file
 * - Run `node verify-config.js` to verify setup
 */

require('dotenv').config();
const CloudAgentService = require('../../services/CloudAgentService');

/**
 * Example 1: Using Claude 3 Opus for complex analysis
 */
async function claudeOpusAnalysis() {
  console.log('=== Example 1: Claude 3 Opus - Complex Analysis ===\n');
  
  const customConfig = {
    provider: 'anthropic',
    defaultModel: 'claude-3-opus',
    providers: {
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
        baseURL: 'https://api.anthropic.com/v1',
        models: {
          'claude-3-opus': { maxTokens: 4096, temperature: 0.7 },
        },
      },
    },
    rateLimit: { maxRequestsPerMinute: 50, maxConcurrent: 5 },
    retry: { maxRetries: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 10, batchDelayMs: 100 },
    timeout: 60000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  try {
    const result = await agentService.delegateTask({
      prompt: `Analyze the ethical implications of artificial general intelligence (AGI).
               Consider multiple perspectives: technological, philosophical, and societal.
               Provide a balanced view with potential benefits and risks.`,
      model: 'claude-3-opus',
      temperature: 0.7,
      maxTokens: 1000,
    });
    
    console.log('Claude 3 Opus Analysis:');
    console.log(result.content);
    console.log(`\nModel: ${result.model}`);
    console.log(`Tokens used: ${JSON.stringify(result.usage)}`);
    console.log(`Stop reason: ${result.stopReason}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('- Ensure ANTHROPIC_API_KEY is set in .env');
    console.error('- Verify your Anthropic account has sufficient credits');
    console.error('- Check if you have access to Claude 3 Opus');
  }
}

/**
 * Example 2: Using Claude 3 Sonnet for balanced tasks
 */
async function claudeSonnetBalanced() {
  console.log('\n\n=== Example 2: Claude 3 Sonnet - Balanced Tasks ===\n');
  
  const customConfig = {
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
    rateLimit: { maxRequestsPerMinute: 50, maxConcurrent: 5 },
    retry: { maxRetries: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 10, batchDelayMs: 100 },
    timeout: 60000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  try {
    const result = await agentService.delegateTask({
      prompt: `Create a structured plan for learning web development from scratch.
               Include: key topics, timeline, and recommended resources.
               Format the response clearly with sections.`,
      model: 'claude-3-sonnet',
      maxTokens: 800,
    });
    
    console.log('Claude 3 Sonnet Response:');
    console.log(result.content);
    console.log(`\nModel: ${result.model}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 3: Using Claude 3 Haiku for fast responses
 */
async function claudeHaikuFast() {
  console.log('\n\n=== Example 3: Claude 3 Haiku - Fast Tasks ===\n');
  
  const customConfig = {
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
    rateLimit: { maxRequestsPerMinute: 50, maxConcurrent: 5 },
    retry: { maxRetries: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 10, batchDelayMs: 100 },
    timeout: 60000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  console.log('Processing quick tasks with Claude 3 Haiku...\n');
  
  const tasks = [
    'Define "machine learning" in one sentence',
    'What is the tallest mountain in the world?',
    'Convert 100 Fahrenheit to Celsius',
    'Name three programming languages',
  ];
  
  try {
    const startTime = Date.now();
    
    for (const task of tasks) {
      const result = await agentService.delegateTask({
        prompt: task,
        maxTokens: 100,
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
 * Example 4: Text analysis and summarization
 */
async function textSummarization() {
  console.log('\n\n=== Example 4: Text Summarization ===\n');
  
  const customConfig = {
    provider: 'anthropic',
    defaultModel: 'claude-3-sonnet',
    providers: {
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
        baseURL: 'https://api.anthropic.com/v1',
        models: {
          'claude-3-sonnet': { maxTokens: 4096, temperature: 0.3 },
        },
      },
    },
    rateLimit: { maxRequestsPerMinute: 50, maxConcurrent: 5 },
    retry: { maxRetries: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 10, batchDelayMs: 100 },
    timeout: 60000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  const longText = `
    Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to 
    the natural intelligence displayed by humans and animals. Leading AI textbooks define 
    the field as the study of "intelligent agents": any device that perceives its environment 
    and takes actions that maximize its chance of successfully achieving its goals. 
    Colloquially, the term "artificial intelligence" is often used to describe machines 
    (or computers) that mimic "cognitive" functions that humans associate with the human 
    mind, such as "learning" and "problem solving".
  `;
  
  try {
    const result = await agentService.delegateTask({
      prompt: `Summarize the following text in 2-3 sentences:\n\n${longText}`,
      temperature: 0.3, // Lower temperature for more focused summary
      maxTokens: 200,
    });
    
    console.log('Original text length:', longText.length, 'characters');
    console.log('\nSummary:');
    console.log(result.content);
    console.log('\nSummary length:', result.content.length, 'characters');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 5: Batch processing with Claude
 */
async function batchProcessing() {
  console.log('\n\n=== Example 5: Batch Processing ===\n');
  
  const customConfig = {
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
    rateLimit: { maxRequestsPerMinute: 50, maxConcurrent: 3 },
    retry: { maxRetries: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 5, batchDelayMs: 100 },
    timeout: 60000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  // Customer feedback to analyze
  const feedbacks = [
    "Great product! Fast delivery and excellent quality.",
    "Product is okay but shipping took too long.",
    "Terrible experience. Product broke after 2 days.",
    "Amazing customer service, very helpful!",
    "Not worth the price, quality is poor.",
  ];
  
  const tasks = feedbacks.map(feedback => ({
    prompt: `Analyze this customer feedback and classify as: Positive, Negative, or Neutral. 
             Also extract key points. Feedback: "${feedback}"`,
    maxTokens: 150,
  }));
  
  console.log('Analyzing customer feedback...\n');
  
  try {
    const results = await agentService.delegateBatch(tasks, {
      ordered: true,
    });
    
    feedbacks.forEach((feedback, index) => {
      console.log(`Feedback ${index + 1}: "${feedback}"`);
      console.log(`Analysis: ${results[index].content}\n`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 6: Creative writing with temperature control
 */
async function creativeWriting() {
  console.log('\n\n=== Example 6: Creative Writing ===\n');
  
  const customConfig = {
    provider: 'anthropic',
    defaultModel: 'claude-3-sonnet',
    providers: {
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
        baseURL: 'https://api.anthropic.com/v1',
        models: {
          'claude-3-sonnet': { maxTokens: 4096, temperature: 0.9 },
        },
      },
    },
    rateLimit: { maxRequestsPerMinute: 50, maxConcurrent: 5 },
    retry: { maxRetries: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 10, batchDelayMs: 100 },
    timeout: 60000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  try {
    const result = await agentService.delegateTask({
      prompt: `Write a short, creative story (150 words) about an AI assistant who dreams of becoming a poet.`,
      temperature: 0.9, // High temperature for creativity
      maxTokens: 300,
    });
    
    console.log('Creative Story:');
    console.log(result.content);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 7: Comparing different Claude models
 */
async function compareModels() {
  console.log('\n\n=== Example 7: Comparing Claude Models ===\n');
  
  const prompt = 'Explain photosynthesis in simple terms.';
  
  console.log(`Prompt: ${prompt}\n`);
  
  // Test with each model
  const models = ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'];
  
  for (const model of models) {
    const customConfig = {
      provider: 'anthropic',
      defaultModel: model,
      providers: {
        anthropic: {
          apiKey: process.env.ANTHROPIC_API_KEY,
          baseURL: 'https://api.anthropic.com/v1',
          models: {
            [model]: { maxTokens: 4096, temperature: 0.7 },
          },
        },
      },
      rateLimit: { maxRequestsPerMinute: 50, maxConcurrent: 5 },
      retry: { maxRetries: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
      batch: { maxBatchSize: 10, batchDelayMs: 100 },
      timeout: 60000,
      logging: { enabled: false, level: 'info', logRequests: false, logResponses: false },
    };
    
    const agentService = new CloudAgentService(customConfig);
    
    try {
      console.log(`--- ${model} ---`);
      const startTime = Date.now();
      
      const result = await agentService.delegateTask({
        prompt,
        maxTokens: 200,
      });
      
      const duration = Date.now() - startTime;
      
      console.log(result.content);
      console.log(`Time: ${duration}ms | Tokens: ${JSON.stringify(result.usage)}\n`);
      
    } catch (error) {
      console.error(`${model} error:`, error.message);
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('Anthropic (Claude) Provider Examples');
  console.log('='.repeat(60));
  console.log();
  
  // Check if API key is configured
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY not found in environment variables');
    console.error('Please set it in your .env file');
    process.exit(1);
  }
  
  // Run examples
  await claudeOpusAnalysis();
  await claudeSonnetBalanced();
  await claudeHaikuFast();
  await textSummarization();
  await batchProcessing();
  await creativeWriting();
  await compareModels();
  
  console.log('\n\n' + '='.repeat(60));
  console.log('All Anthropic examples completed!');
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
  claudeOpusAnalysis,
  claudeSonnetBalanced,
  claudeHaikuFast,
  textSummarization,
  batchProcessing,
  creativeWriting,
  compareModels,
};
