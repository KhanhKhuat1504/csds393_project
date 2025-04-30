/**
 * @fileoverview Tests for the content moderation service.
 * This file contains tests for the isInappropriate function that checks content against
 * Google Cloud Platform's content moderation API to detect potentially harmful content.
 * 
 * @jest-environment node
 * @module tests/moderation
 */
import { isInappropriate } from "@/lib/moderation";
import { GoogleAuth } from 'google-auth-library';

/**
 * Mock required environment variables.
 * In production, GCP_KEY_B64 contains a base64-encoded service account key.
 * For testing, we use a mock value to avoid needing real credentials.
 */
process.env.GCP_KEY_B64 = 'mock-base64-key';

/**
 * Mock Buffer.from to avoid actual base64 decoding of credentials.
 * This substitutes the actual Buffer.from implementation with a mock that returns
 * a predefined JSON string when decoding the mock GCP key.
 */
const originalBufferFrom = Buffer.from;
Buffer.from = jest.fn().mockImplementation((input, encoding) => {
  if (input === 'mock-base64-key' && encoding === 'base64') {
    return {
      toString: jest.fn().mockReturnValue('{"type": "service_account"}')
    };
  }
  return originalBufferFrom(input, encoding);
});

/**
 * Mock the GoogleAuth library to avoid making actual API calls during tests.
 * This replaces the actual GoogleAuth implementation with a mock that doesn't
 * make network requests but returns controlled test values.
 */
jest.mock('google-auth-library', () => {
  return {
    GoogleAuth: jest.fn().mockImplementation(() => ({
      getClient: jest.fn().mockResolvedValue({
        request: jest.fn(),
      }),
    })),
  };
});

/**
 * Test suite for the isInappropriate function.
 * Tests various scenarios of content moderation responses.
 */
describe('isInappropriate', () => {
  /**
   * Tests that content is correctly identified as inappropriate when
   * at least one moderation category exceeds the confidence threshold.
   */
  it('should return true if any category confidence exceeds threshold', async () => {
    const fakeRequest = jest.fn().mockResolvedValue({
      data: {
        moderationCategories: [
          { name: 'Toxic', confidence: 0.9 },
        ],
      },
    });

    (GoogleAuth as unknown as jest.Mock).mockImplementation(() => ({
      getClient: async () => ({ request: fakeRequest }),
    }));

    const result = await isInappropriate('you suck');
    expect(result).toBe(true);
  });

  /**
   * Tests that content is correctly identified as appropriate when
   * all moderation categories are below the confidence threshold.
   */
  it('should return false if all categories are below threshold', async () => {
    const fakeRequest = jest.fn().mockResolvedValue({
      data: {
        moderationCategories: [
          { name: 'Profanity', confidence: 0.2 },
        ],
      },
    });

    (GoogleAuth as unknown as jest.Mock).mockImplementation(() => ({
      getClient: async () => ({ request: fakeRequest }),
    }));

    const result = await isInappropriate('hello friend');
    expect(result).toBe(false);
  });

  /**
   * Tests that the function safely handles API errors by defaulting
   * to treating content as inappropriate (the safer option).
   */
  it('should return true on API error', async () => {
    const fakeRequest = jest.fn().mockRejectedValue(new Error('API error'));

    (GoogleAuth as unknown as jest.Mock).mockImplementation(() => ({
      getClient: async () => ({ request: fakeRequest }),
    }));

    const result = await isInappropriate('crash');
    expect(result).toBe(true);
  });

  /**
   * Cleanup: Restore the original Buffer.from function after all tests are complete
   * to avoid affecting other tests that might run afterward.
   */
  afterAll(() => {
    Buffer.from = originalBufferFrom;
  });
});
