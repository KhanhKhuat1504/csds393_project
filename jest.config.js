/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  // Explicitly set transform to use ts-jest for all TypeScript files
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  // Ignore TypeScript type errors during tests
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};
