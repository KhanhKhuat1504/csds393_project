/**
 * @jest-environment node
*/
import { isInappropriate } from "@/lib/moderation";
import { GoogleAuth } from 'google-auth-library';

// Mock the google-auth-library
jest.mock('google-auth-library', () => {
  return {
    GoogleAuth: jest.fn().mockImplementation(() => ({
      getClient: jest.fn().mockResolvedValue({
        request: jest.fn(),
      }),
    })),
  };
});

describe('isInappropriate', () => {
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

  it('should return true on API error', async () => {
    const fakeRequest = jest.fn().mockRejectedValue(new Error('API error'));

    (GoogleAuth as unknown as jest.Mock).mockImplementation(() => ({
      getClient: async () => ({ request: fakeRequest }),
    }));

    const result = await isInappropriate('crash');
    expect(result).toBe(true);
  });
});
