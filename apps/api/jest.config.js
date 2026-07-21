module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', {tsconfig: '<rootDir>/tsconfig.json'}],
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
