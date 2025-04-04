import { jest, afterAll } from '@jest/globals';

// Increase Jest timeout for MongoDB operations
jest.setTimeout(30000);

// Make console output more verbose for debugging purposes
process.env.DEBUG = 'mongodb-memory-server';

// Mock environment variables used in the application
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

// Common mock for google-auth-library
// Only used as fallback, individual tests can override this
jest.mock('google-auth-library', () => {
  // @ts-ignore - We're ignoring TypeScript errors here because the Jest mock types 
  // are complex with nested functions. This mock works correctly at runtime despite 
  // the TypeScript compiler warnings about parameter types.
  return {
    GoogleAuth: jest.fn().mockImplementation(() => ({
      getClient: jest.fn().mockResolvedValue({
        request: jest.fn().mockResolvedValue({
          data: {
            moderationCategories: [
              { name: 'Test', confidence: 0.5 }
            ]
          }
        }),
      }),
    })),
  };
}, { virtual: true });

// Global mock for the moderation service
// Only used as fallback, individual tests can override this
jest.mock('../lib/moderation', () => {
  return {
    // @ts-ignore - Simplified mock implementation
    isInappropriate: jest.fn((text) => Promise.resolve(false))
  };
}, { virtual: true });

// Disable console.log during tests to keep output clean
// Comment this out if you need to debug tests with console.log
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
console.log = jest.fn();
console.error = jest.fn();

// Restore console functions after tests
afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}); 