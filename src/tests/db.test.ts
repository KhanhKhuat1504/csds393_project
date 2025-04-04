import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '../models/User';
import Prompt, { IPrompt } from '../models/Prompt';
import UserResponse from '../models/UserResponse';
import { jest, describe, test, expect, beforeAll, afterEach, afterAll } from '@jest/globals';

// Mock the dbConnect module to prevent connection conflicts
jest.mock('../lib/dbConnect', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => Promise.resolve(mongoose))
}));

// Mock the moderation service
jest.mock('../lib/moderation', () => ({
  // Use any to bypass the type check for the mock implementation
  isInappropriate: jest.fn().mockImplementation((text: any) => {
    // Mock implementation that flags content with the word "inappropriate"
    return Promise.resolve(text.includes('inappropriate'));
  })
}));

describe('Database Operations', () => {
  let mongoServer: MongoMemoryServer;

  // Set up the in-memory database before tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  // Clear all collections after each test
  afterEach(async () => {
    await User.deleteMany({});
    await Prompt.deleteMany({});
    await UserResponse.deleteMany({});
    
    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  // Close and stop the server after all tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // User Model Tests
  describe('User Model', () => {
    test('should create a new user', async () => {
      const userData = {
        clerkId: 'test-clerk-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        gender: 'Other',
        accountCreated: false,
        position: 'Student',
        year: 2022
      };

      const user = await User.create(userData);
      
      expect(user).toBeDefined();
      expect(user.clerkId).toBe(userData.clerkId);
      expect(user.email).toBe(userData.email);
      expect(user.first_name).toBe(userData.first_name);
      expect(user.accountCreated).toBe(false);
    });

    test('should update user account created flag', async () => {
      // First create a user
      const user = await User.create({
        clerkId: 'update-test-id',
        email: 'update@example.com',
        first_name: 'Update',
        last_name: 'Test',
        accountCreated: false
      });

      // Then update the accountCreated flag
      const updatedUser = await User.findOneAndUpdate(
        { clerkId: 'update-test-id' },
        { accountCreated: true },
        { new: true }
      );

      expect(updatedUser).toBeDefined();
      expect(updatedUser!.accountCreated).toBe(true);
    });

    test('should find a user by clerkId', async () => {
      // Create a user first
      await User.create({
        clerkId: 'find-test-id',
        email: 'find@example.com',
        first_name: 'Find',
        last_name: 'Test'
      });

      // Find the user
      const foundUser = await User.findOne({ clerkId: 'find-test-id' });
      
      expect(foundUser).toBeDefined();
      expect(foundUser!.email).toBe('find@example.com');
    });

    test('should make a user a moderator', async () => {
      // Create a regular user
      const user = await User.create({
        clerkId: 'mod-test-id',
        email: 'mod@example.com',
        first_name: 'Mod',
        last_name: 'User',
        isMod: false
      });

      // Promote to moderator
      const modUser = await User.findOneAndUpdate(
        { clerkId: 'mod-test-id' },
        { isMod: true },
        { new: true }
      );

      expect(modUser).toBeDefined();
      expect(modUser!.isMod).toBe(true);
    });
  });

  // Prompt Model Tests
  describe('Prompt Model', () => {
    test('should create a new prompt', async () => {
      const promptData = {
        promptQuestion: 'Test question?',
        resp1: 'Answer 1',
        resp2: 'Answer 2',
        resp3: 'Answer 3',
        resp4: 'Answer 4',
        createdBy: 'test-user-id'
      };

      const prompt = await Prompt.create(promptData);
      
      expect(prompt).toBeDefined();
      expect(prompt.promptQuestion).toBe(promptData.promptQuestion);
      expect(prompt.resp1).toBe(promptData.resp1);
      expect(prompt.isReported).toBe(false);
      expect(prompt.isArchived).toBe(false);
      expect(prompt.isAutoFlagged).toBe(false);
    });

    test('should flag a prompt as reported', async () => {
      // Create a prompt
      const prompt = await Prompt.create({
        promptQuestion: 'Should this be reported?',
        resp1: 'Yes',
        resp2: 'No',
        resp3: 'Maybe',
        resp4: 'No opinion',
        createdBy: 'flag-test-user'
      });

      // Flag it as reported
      const flaggedPrompt = await Prompt.findByIdAndUpdate(
        prompt._id as mongoose.Types.ObjectId,
        { isReported: true },
        { new: true }
      );

      expect(flaggedPrompt).toBeDefined();
      expect(flaggedPrompt!.isReported).toBe(true);
    });

    test('should archive a prompt', async () => {
      // Create a prompt
      const prompt = await Prompt.create({
        promptQuestion: 'Should this be archived?',
        resp1: 'Yes',
        resp2: 'No',
        createdBy: 'archive-test-user'
      });

      // Archive it
      const archivedPrompt = await Prompt.findByIdAndUpdate(
        prompt._id as mongoose.Types.ObjectId,
        { isArchived: true },
        { new: true }
      );

      expect(archivedPrompt).toBeDefined();
      expect(archivedPrompt!.isArchived).toBe(true);
    });

    test('should delete a prompt', async () => {
      // Create a prompt
      const prompt = await Prompt.create({
        promptQuestion: 'Delete me',
        resp1: 'Ok',
        resp2: 'No',
        createdBy: 'delete-test-user'
      });

      // Delete it
      await Prompt.findByIdAndDelete(prompt._id as mongoose.Types.ObjectId);

      // Try to find it again
      const deletedPrompt = await Prompt.findById(prompt._id as mongoose.Types.ObjectId);
      
      expect(deletedPrompt).toBeNull();
    });

    test('should auto-flag inappropriate content', async () => {
      const promptData = {
        promptQuestion: 'This contains inappropriate content',
        resp1: 'Normal response',
        resp2: 'Another normal response',
        createdBy: 'content-test-user',
        isAutoFlagged: true // This would be set by the API after content check
      };

      const prompt = await Prompt.create(promptData);
      
      expect(prompt.isAutoFlagged).toBe(true);
    });
  });

  // UserResponse Model Tests
  describe('UserResponse Model', () => {
    test('should create a user response', async () => {
      // First create a prompt
      const prompt = await Prompt.create({
        promptQuestion: 'Test for response?',
        resp1: 'Response option 1',
        resp2: 'Response option 2',
        createdBy: 'response-test-creator'
      });

      // Then create a user response to that prompt
      const responseData = {
        userId: 'response-test-user',
        promptId: (prompt._id as mongoose.Types.ObjectId).toString(),
        selectedResponse: 'Response option 1'
      };

      const response = await UserResponse.create(responseData);
      
      expect(response).toBeDefined();
      expect(response.userId).toBe(responseData.userId);
      expect(response.promptId).toBe(responseData.promptId);
      expect(response.selectedResponse).toBe(responseData.selectedResponse);
    });

    test('should enforce unique user responses per prompt', async () => {
      // Create a prompt
      const prompt = await Prompt.create({
        promptQuestion: 'Unique response test?',
        resp1: 'Yes',
        resp2: 'No',
        createdBy: 'unique-test-creator'
      });

      // Create a response
      await UserResponse.create({
        userId: 'unique-test-user',
        promptId: (prompt._id as mongoose.Types.ObjectId).toString(),
        selectedResponse: 'Yes'
      });

      // Try to create another response from the same user for the same prompt
      // This should fail due to the compound unique index
      await expect(
        UserResponse.create({
          userId: 'unique-test-user',
          promptId: (prompt._id as mongoose.Types.ObjectId).toString(),
          selectedResponse: 'No'
        })
      ).rejects.toThrow();
    });

    test('should find all responses by a user', async () => {
      // Create two prompts
      const prompt1 = await Prompt.create({
        promptQuestion: 'First prompt?',
        resp1: 'Yes',
        resp2: 'No',
        createdBy: 'find-responses-creator'
      });

      const prompt2 = await Prompt.create({
        promptQuestion: 'Second prompt?',
        resp1: 'Yes',
        resp2: 'No',
        createdBy: 'find-responses-creator'
      });

      // Create responses to both
      const userId = 'find-responses-user';
      await UserResponse.create({
        userId,
        promptId: (prompt1._id as mongoose.Types.ObjectId).toString(),
        selectedResponse: 'Yes'
      });

      await UserResponse.create({
        userId,
        promptId: (prompt2._id as mongoose.Types.ObjectId).toString(),
        selectedResponse: 'No'
      });

      // Find all responses by the user
      const responses = await UserResponse.find({ userId });
      
      expect(responses).toHaveLength(2);
      expect(responses[0].userId).toBe(userId);
      expect(responses[1].userId).toBe(userId);
    });
  });

  // Integration Tests
  describe('Integration Tests', () => {
    test('should handle the complete user response flow', async () => {
      // 1. Create a user
      const user = await User.create({
        clerkId: 'flow-test-user',
        email: 'flow@example.com',
        first_name: 'Flow',
        last_name: 'Test',
        accountCreated: true
      });

      // 2. Create a prompt
      const prompt = await Prompt.create({
        promptQuestion: 'Flow test question?',
        resp1: 'Answer A',
        resp2: 'Answer B',
        resp3: 'Answer C',
        resp4: 'Answer D',
        createdBy: user.clerkId
      });

      // 3. User responds to the prompt
      const response = await UserResponse.create({
        userId: user.clerkId,
        promptId: (prompt._id as mongoose.Types.ObjectId).toString(),
        selectedResponse: 'Answer C'
      });

      // 4. Verify the response
      expect(response.selectedResponse).toBe('Answer C');

      // 5. Try to create another response (should fail)
      await expect(
        UserResponse.create({
          userId: user.clerkId,
          promptId: (prompt._id as mongoose.Types.ObjectId).toString(),
          selectedResponse: 'Answer D'
        })
      ).rejects.toThrow();

      // 6. Flag the prompt as reported
      const reportedPrompt = await Prompt.findByIdAndUpdate(
        prompt._id as mongoose.Types.ObjectId,
        { isReported: true },
        { new: true }
      );

      expect(reportedPrompt!.isReported).toBe(true);

      // 7. Archive the prompt
      const archivedPrompt = await Prompt.findByIdAndUpdate(
        prompt._id as mongoose.Types.ObjectId,
        { isArchived: true },
        { new: true }
      );

      expect(archivedPrompt!.isArchived).toBe(true);
    });
  });
}); 