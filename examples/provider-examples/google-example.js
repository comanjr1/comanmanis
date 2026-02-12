/**
 * Google AI (Gemini) Provider Example
 * 
 * This example demonstrates CloudAgentService with Google's Gemini models:
 * - Gemini Pro for text generation
 * - Gemini Pro Vision for multimodal tasks
 * - Google AI-specific features and configurations
 * 
 * Prerequisites:
 * - Set GOOGLE_AI_API_KEY in your .env file
 * - Run `node verify-config.js` to verify setup
 */

require('dotenv').config();
const CloudAgentService = require('../../services/CloudAgentService');

/**
 * Example 1: Basic text generation with Gemini Pro
 */
async function geminiProBasic() {
  console.log('=== Example 1: Gemini Pro - Basic Text Generation ===\n');
  
  const customConfig = {
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
    rateLimit: { maxRequestsPerMinute: 60, maxConcurrent: 5 },
    retry: { maxRetries: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
    batch: { maxBatchSize: 10, batchDelayMs: 100 },
    timeout: 60000,
    logging: { enabled: true, level: 'info', logRequests: false, logResponses: false },
  };
  
  const agentService = new CloudAgentService(customConfig);
  
  try {
    const result = await agentService.delegateTask({
      prompt: `Explain the concept of cloud computing and its main benefits for businesses.
               Keep the explanation clear and concise.`,
      model: 'gemini-pro',
      temperature: 0.7,
      maxTokens: 500,
    });
    
    console.log('Gemini Pro Response:');
    console.log(result.content);
    console.log(`\nModel: ${result.model}`);
    console.log(`Usage: ${JSON.stringify(result.usage)}`);
    console.log(`Finish reason: ${result.finishReason}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('- Ensure GOOGLE_AI_API_KEY is set in .env');
    console.error('- Verify your Google AI API key is valid');
    console.error('- Check if Gemini API is enabled in your Google Cloud project');
  }
}

/**
 * Example 2: Question answering with Gemini
 */
async function questionAnswering() {
  console.log('\n\n=== Example 2: Question Answering ===\n');
  
  const customConfig = {
    provider: 'google',
    defaultModel: 'gemini-pro',
    providers: {
      google: {
        apiKey: process.env.GOOGLE_AI_API_KEY,
        baseURL: 'https://generativelanguage.googleapis.com/v1',
        models: {
          'gemini-pro': { maxTokens: 2048, temperature: 0.4 },
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
  
  const questions = [
    'What is the speed of light?',
    'Who invented the telephone?',
    'What is the largest planet in our solar system?',
    'When was the first computer invented?',
  ];
  
  console.log('Asking Gemini Pro several questions...\n');
  
  try {
    for (const question of questions) {
      const result = await agentService.delegateTask({
        prompt: `Answer this question briefly and accurately: ${question}`,
        temperature: 0.4, // Lower temperature for factual answers
        maxTokens: 150,
      });
      
      console.log(`Q: ${question}`);
      console.log(`A: ${result.content}\n`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 3: Content generation with creativity
 */
async function creativeContent() {
  console.log('\n\n=== Example 3: Creative Content Generation ===\n');
  
  const customConfig = {
    provider: 'google',
    defaultModel: 'gemini-pro',
    providers: {
      google: {
        apiKey: process.env.GOOGLE_AI_API_KEY,
        baseURL: 'https://generativelanguage.googleapis.com/v1',
        models: {
          'gemini-pro': { maxTokens: 2048, temperature: 0.9 },
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
      prompt: `Write a creative tagline for a futuristic eco-friendly car company.
               Make it memorable and inspiring.`,
      temperature: 0.9, // Higher temperature for creativity
      maxTokens: 100,
    });
    
    console.log('Creative Tagline:');
    console.log(result.content);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 4: Code explanation and documentation
 */
async function codeExplanation() {
  console.log('\n\n=== Example 4: Code Explanation ===\n');
  
  const customConfig = {
    provider: 'google',
    defaultModel: 'gemini-pro',
    providers: {
      google: {
        apiKey: process.env.GOOGLE_AI_API_KEY,
        baseURL: 'https://generativelanguage.googleapis.com/v1',
        models: {
          'gemini-pro': { maxTokens: 2048, temperature: 0.3 },
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
  
  const code = `
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }
  `;
  
  try {
    const result = await agentService.delegateTask({
      prompt: `Explain what this code does and identify any potential issues:\n\n${code}`,
      temperature: 0.3,
      maxTokens: 400,
    });
    
    console.log('Code Analysis:');
    console.log(result.content);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 5: Batch processing with Gemini
 */
async function batchProcessing() {
  console.log('\n\n=== Example 5: Batch Text Classification ===\n');
  
  const customConfig = {
    provider: 'google',
    defaultModel: 'gemini-pro',
    providers: {
      google: {
        apiKey: process.env.GOOGLE_AI_API_KEY,
        baseURL: 'https://generativelanguage.googleapis.com/v1',
        models: {
          'gemini-pro': { maxTokens: 2048, temperature: 0.5 },
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
  
  const articles = [
    'Scientists discover new species of deep-sea fish',
    'Stock market reaches all-time high',
    'New smartphone released with advanced camera',
    'Championship game ends in overtime victory',
    'Government announces new environmental policy',
  ];
  
  const tasks = articles.map(article => ({
    prompt: `Classify this headline into one category: Technology, Business, Science, Sports, or Politics.
             Only respond with the category name. Headline: "${article}"`,
    maxTokens: 20,
  }));
  
  console.log('Classifying article headlines...\n');
  
  try {
    const results = await agentService.delegateBatch(tasks, {
      ordered: true,
    });
    
    articles.forEach((article, index) => {
      console.log(`"${article}"`);
      console.log(`Category: ${results[index].content.trim()}\n`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 6: Multi-step reasoning
 */
async function multiStepReasoning() {
  console.log('\n\n=== Example 6: Multi-Step Reasoning ===\n');
  
  const customConfig = {
    provider: 'google',
    defaultModel: 'gemini-pro',
    providers: {
      google: {
        apiKey: process.env.GOOGLE_AI_API_KEY,
        baseURL: 'https://generativelanguage.googleapis.com/v1',
        models: {
          'gemini-pro': { maxTokens: 2048, temperature: 0.5 },
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
      prompt: `Solve this problem step by step:
               A train leaves Station A at 9:00 AM traveling at 60 mph toward Station B.
               Another train leaves Station B at 9:30 AM traveling at 80 mph toward Station A.
               If the stations are 300 miles apart, at what time will the trains meet?
               
               Show your work and explain each step.`,
      temperature: 0.5,
      maxTokens: 600,
    });
    
    console.log('Problem Solution:');
    console.log(result.content);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 7: Data extraction and formatting
 */
async function dataExtraction() {
  console.log('\n\n=== Example 7: Data Extraction ===\n');
  
  const customConfig = {
    provider: 'google',
    defaultModel: 'gemini-pro',
    providers: {
      google: {
        apiKey: process.env.GOOGLE_AI_API_KEY,
        baseURL: 'https://generativelanguage.googleapis.com/v1',
        models: {
          'gemini-pro': { maxTokens: 2048, temperature: 0.2 },
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
  
  const text = `
    John Smith works at Acme Corporation as a Software Engineer.
    His email is john.smith@acme.com and his phone number is (555) 123-4567.
    He has been with the company since January 2020.
  `;
  
  try {
    const result = await agentService.delegateTask({
      prompt: `Extract the following information from the text and format as JSON:
               - name
               - company
               - position
               - email
               - phone
               - start_date
               
               Text: ${text}`,
      temperature: 0.2, // Low temperature for precise extraction
      maxTokens: 300,
    });
    
    console.log('Extracted Data:');
    console.log(result.content);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('Google AI (Gemini) Provider Examples');
  console.log('=' .repeat(60));
  console.log();
  
  // Check if API key is configured
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.error('ERROR: GOOGLE_AI_API_KEY not found in environment variables');
    console.error('Please set it in your .env file');
    process.exit(1);
  }
  
  // Run examples
  await geminiProBasic();
  await questionAnswering();
  await creativeContent();
  await codeExplanation();
  await batchProcessing();
  await multiStepReasoning();
  await dataExtraction();
  
  console.log('\n\n' + '='.repeat(60));
  console.log('All Google AI examples completed!');
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
  geminiProBasic,
  questionAnswering,
  creativeContent,
  codeExplanation,
  batchProcessing,
  multiStepReasoning,
  dataExtraction,
};
