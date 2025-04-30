# Testing Documentation

This document provides an overview of the unit testing approach and test suite structure for the project.

## Testing Setup

The testing framework uses Jest with the following configuration:

- **File:** `src/tests/setup.ts`
- **Purpose:** Contains global test configuration and mocks
- **Features:**
  - Increased Jest timeout for MongoDB operations (30s)
  - Mock environment variables
  - Global mocks for common services, like Google Auth and moderation
  - Console output control during tests

## Test Files

### Database Tests (db.test.ts)

Tests the database models and operations using MongoDB Memory Server for isolated testing.

**Coverage:**

- **User Model:**
  - Creating new users
  - Updating user information
  - Finding users by clerkId
  - User role management (moderator promotion)

- **Prompt Model:**
  - Creating new prompts
  - Flagging prompts as reported
  - Archiving prompts
  - Deleting prompts

- **User Response Model:**
  - Creating user responses
  - Retrieving user responses by prompt
  - Response analysis functions

### API Tests (api.test.ts)

Tests the Next.js API endpoints using node-mocks-http to simulate requests and responses.

**Coverage:**

- **User API:**
  - Creating new users
  - Updating user information
  - Profile retrieval

- **Prompt API:**
  - Creating new prompts
  - Updating prompt flags
  - Deleting prompts
  - Retrieving prompts with filtering

- **User Response API:**
  - Submitting user responses
  - Retrieving responses for analysis
  - Response data validation

### Moderation Tests (moderation.test.ts)

Tests the content moderation service.

**Coverage:**
- Detection of inappropriate content
- Confidence threshold testing
- Error handling in the moderation service

## Running Tests

Tests can be run using the following command:

```bash
npm run test
```

To run a specific test file:

```bash
npm run test -- src/tests/api.test.ts
```

## Mock Strategy

The test suite uses the following mock strategy:

1. **MongoDB**: Uses mongodb-memory-server for in-memory database testing
2. **Google Auth**: Mocked to simulate content moderation responses
3. **Moderation Service**: Has configurable mocks to test different content conditions
4. **Database Connection**: Mocked to prevent connection conflicts

## Best Practices

When adding new tests:

1. Follow the existing patterns for each test type
2. Ensure proper cleanup in afterEach hooks
3. Use descriptive test names that explain what is being tested
4. Keep tests independent (no dependencies between test cases)
5. For API tests, use the typedMocks helper function for proper NextApiRequest/Response types
6. Mock external services and APIs to isolate test cases

## Code Coverage

Code coverage reports can be generated with:

```bash
npm run test:coverage
```

The coverage report includes information on:
- Statement coverage
- Branch coverage
- Function coverage
- Line coverage 