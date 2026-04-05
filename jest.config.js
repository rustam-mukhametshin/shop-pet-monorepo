module.exports = {
  displayName: 'nodejs-complete-guide',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.ts$': '<rootDir>/jest.ts-transformer.js',
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'app.ts',
    'controllers/**/*.ts',
    'models/**/*.ts',
    'routes/**/*.ts',
    'util/**/*.ts',
    'controllers/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'util/**/*.js',
    '!node_modules/**',
    '!dist/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  verbose: true,
};

