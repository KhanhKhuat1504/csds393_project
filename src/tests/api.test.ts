import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createMocks } from 'node-mocks-http';
import { jest, describe, test, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import type { NextApiRequest, NextApiResponse } from 'next';

// Mock the dbConnect module
jest.mock('../lib/dbConnect', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => Promise.resolve(mongoose))
}));

// Import the API handlers
import userHandler from '../pages/api/users';
import promptHandler from '../pages/api/prompt';
import userResponseHandler from '../pages/api/user-responses';

// Mock the moderation service
jest.mock('../lib/moderation', () => ({
  // Use any to bypass the type check for the mock implementation
  isInappropriate: jest.fn().mockImplementation((text: any) => {
    return Promise.resolve(text.includes('inappropriate'));
  })
}));

// Helper function to create properly typed mocks
function typedMocks(options: any) {
  const { req, res } = createMocks(options);
  // Add the env property required by NextApiRequest
  (req as any).env = {};
  return { 
    req: req as unknown as NextApiRequest, 
    res: res as unknown as NextApiResponse 
  };
}

describe('API Endpoints', () => {
  let mongoServer: MongoMemoryServer;

  // Set up the in-memory database before tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // Set up mongoose connection manually
    await mongoose.connect(uri);
    
    // Ensure Mongoose knows about our models
    // This is needed because we mocked dbConnect
    require('../models/User');
    require('../models/Prompt');
    require('../models/UserResponse');
  });

  // Clean up after each test
  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    
    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  // Disconnect and stop the server after all tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // User API Tests
  describe('User API', () => {
    test('should create a new user', async () => {
      const { req, res } = typedMocks({
        method: 'POST',
        body: {
          clerkId: 'api-test-clerk-id',
          email: 'api-test@example.com',
          first_name: 'API',
          last_name: 'Test',
          gender: 'Other'
        }
      });

      await userHandler(req, res);

      expect((res as any)._getStatusCode()).toBe(201);
      const data = JSON.parse((res as any)._getData());
      expect(data.success).toBe(true);
      expect(data.data.email).toBe('api-test@example.com');
    });

    test('should update a user', async () => {
      // First create a user
      const { req: createReq, res: createRes } = typedMocks({
        method: 'POST',
        body: {
          clerkId: 'update-api-id',
          email: 'update-api@example.com',
          first_name: 'Update',
          last_name: 'API',
          accountCreated: false
        }
      });

      await userHandler(createReq, createRes);
      const createData = JSON.parse((createRes as any)._getData());
      
      // Then update the user
      const { req: updateReq, res: updateRes } = typedMocks({
        method: 'PUT',
        body: {
          id: createData.data.clerkId,
          accountCreated: true,
          position: 'Developer'
        }
      });

      await userHandler(updateReq, updateRes);

      expect((updateRes as any)._getStatusCode()).toBe(200);
      const updateData = JSON.parse((updateRes as any)._getData());
      expect(updateData.success).toBe(true);
      expect(updateData.data.accountCreated).toBe(true);
      expect(updateData.data.position).toBe('Developer');
    });
  });

  // Prompt API Tests
  describe('Prompt API', () => {
    test('should create a new prompt', async () => {
      const { req, res } = typedMocks({
        method: 'POST',
        body: {
          promptQuestion: 'API Test Question?',
          resp1: 'API Answer 1',
          resp2: 'API Answer 2',
          resp3: 'API Answer 3',
          resp4: 'API Answer 4',
          createdBy: 'api-creator-id'
        }
      });

      await promptHandler(req, res);

      expect((res as any)._getStatusCode()).toBe(201);
      const data = JSON.parse((res as any)._getData());
      expect(data.success).toBe(true);
      expect(data.data.promptQuestion).toBe('API Test Question?');
      expect(data.data.isAutoFlagged).toBe(false);
    });

    test('should update a prompt flag', async () => {
      // First create a prompt
      const { req: createReq, res: createRes } = typedMocks({
        method: 'POST',
        body: {
          promptQuestion: 'Should this be reported via API?',
          resp1: 'Yes',
          resp2: 'No',
          createdBy: 'api-report-creator'
        }
      });

      await promptHandler(createReq, createRes);
      const createData = JSON.parse((createRes as any)._getData());
      
      // Then update its reported status
      const { req: updateReq, res: updateRes } = typedMocks({
        method: 'PUT',
        body: {
          id: createData.data._id,
          isReported: true
        }
      });

      await promptHandler(updateReq, updateRes);

      expect((updateRes as any)._getStatusCode()).toBe(200);
      const updateData = JSON.parse((updateRes as any)._getData());
      expect(updateData.success).toBe(true);
      expect(updateData.data.isReported).toBe(true);
    });

    test('should delete a prompt', async () => {
      // First create a prompt
      const { req: createReq, res: createRes } = typedMocks({
        method: 'POST',
        body: {
          promptQuestion: 'Delete this via API',
          resp1: 'Yes',
          resp2: 'No',
          createdBy: 'api-delete-creator'
        }
      });

      await promptHandler(createReq, createRes);
      const createData = JSON.parse((createRes as any)._getData());
      const promptId = createData.data._id;
      
      // Then delete it
      const { req: deleteReq, res: deleteRes } = typedMocks({
        method: 'DELETE',
        query: {
          id: promptId
        }
      });

      await promptHandler(deleteReq, deleteRes);

      expect((deleteRes as any)._getStatusCode()).toBe(200);
      
      // Verify it's gone
      const { req: getReq, res: getRes } = typedMocks({
        method: 'GET',
        query: {
          id: promptId
        }
      });

      await promptHandler(getReq, getRes);
      
      expect((getRes as any)._getStatusCode()).toBe(404);
    });
  });

  // UserResponse API Tests
  describe('UserResponse API', () => {
    test('should create a user response', async () => {
      // First create a prompt
      const { req: promptReq, res: promptRes } = typedMocks({
        method: 'POST',
        body: {
          promptQuestion: 'Question for response test?',
          resp1: 'Response 1',
          resp2: 'Response 2',
          createdBy: 'response-api-creator'
        }
      });

      await promptHandler(promptReq, promptRes);
      const promptData = JSON.parse((promptRes as any)._getData());
      
      // Then create a response to it
      const { req, res } = typedMocks({
        method: 'POST',
        body: {
          userId: 'response-api-user',
          promptId: promptData.data._id,
          selectedResponse: 'Response 1'
        }
      });

      await userResponseHandler(req, res);

      expect((res as any)._getStatusCode()).toBe(201);
      const data = JSON.parse((res as any)._getData());
      expect(data.success).toBe(true);
      expect(data.data.selectedResponse).toBe('Response 1');
    });

    test('should prevent duplicate responses', async () => {
      // First create a prompt
      const { req: promptReq, res: promptRes } = typedMocks({
        method: 'POST',
        body: {
          promptQuestion: 'Question for duplicate test?',
          resp1: 'Response A',
          resp2: 'Response B',
          createdBy: 'duplicate-api-creator'
        }
      });

      await promptHandler(promptReq, promptRes);
      const promptData = JSON.parse((promptRes as any)._getData());
      const promptId = promptData.data._id;
      
      // Then create a response
      const { req: responseReq, res: responseRes } = typedMocks({
        method: 'POST',
        body: {
          userId: 'duplicate-api-user',
          promptId: promptId,
          selectedResponse: 'Response A'
        }
      });

      await userResponseHandler(responseReq, responseRes);
      
      // Try to create another response for the same user/prompt
      const { req: duplicateReq, res: duplicateRes } = typedMocks({
        method: 'POST',
        body: {
          userId: 'duplicate-api-user',
          promptId: promptId,
          selectedResponse: 'Response B'
        }
      });

      await userResponseHandler(duplicateReq, duplicateRes);
      
      expect((duplicateRes as any)._getStatusCode()).toBe(400);
      const data = JSON.parse((duplicateRes as any)._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('already responded');
    });
  });
}); 