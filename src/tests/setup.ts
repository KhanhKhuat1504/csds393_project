/**
 * @fileoverview Test setup configuration for the application.
 * This file contains global Jest configurations, mock implementations, and environment variable setup
 * that will be applied to all test files. It handles common test setup operations
 * to avoid repeating the same setup code in multiple test files.
 * 
 * @module tests/setup
 */

import { jest, afterAll } from '@jest/globals';

// Increase Jest timeout for MongoDB operations
jest.setTimeout(30000);

// Make console output more verbose for debugging purposes
process.env.DEBUG = 'mongodb-memory-server';

/**
 * Mock MongoDB URI for testing.
 * This ensures tests use a test database instead of the production database.
 */
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

/**
 * Global mock for the Google Auth library.
 * Provides a default implementation that can be overridden in specific tests.
 * Returns a mock client that responds with safe moderation content by default.
 */
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

/**
 * Global mock for the moderation service.
 * By default, the mock implementation returns false (content is appropriate)
 * to prevent test content from being accidentally flagged during testing.
 * Individual tests can override this behavior as needed.
 */
jest.mock('../lib/moderation', () => {
  return {
    // @ts-ignore - Simplified mock implementation
    isInappropriate: jest.fn((text) => Promise.resolve(false))
  };
}, { virtual: true });

/**
 * Disable console output during tests to keep the test output clean and focused.
 * This replaces the standard console methods with Jest mock functions that don't
 * produce output.
 * 
 * To debug tests with console output, comment out these lines.
 */
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
console.log = jest.fn();
console.error = jest.fn();

/**
 * Restore the original console functions after all tests are complete.
 * This ensures that console output works normally after testing.
 */
afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}); 