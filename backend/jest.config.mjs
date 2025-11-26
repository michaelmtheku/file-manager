export default {
  testEnvironment: 'node',
  verbose: true,
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/tests/**/*.test.mjs'],
  setupFilesAfterEnv: ['<rootDir>/tests/testSetup.js'],
  transform: {},
  maxWorkers: 1
};