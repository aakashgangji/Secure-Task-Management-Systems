module.exports = {
  displayName: 'Working Tests',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../../',
  testMatch: [
    '<rootDir>/testing/backend/simple/**/*.spec.ts'
  ],
  collectCoverageFrom: [
    'testing/backend/simple/**/*.ts',
    '!testing/backend/simple/**/*.spec.ts'
  ],
  coverageDirectory: '<rootDir>/coverage/working',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/testing/config/test-setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      isolatedModules: true,
      useESM: false
    }]
  },
  testTimeout: 10000,
  verbose: true,
  collectCoverage: false,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/testing/backend/rbac/',
    '/testing/backend/auth/',
    '/testing/backend/endpoints/',
    '/testing/frontend/'
  ],
  // Skip problematic files
  modulePathIgnorePatterns: [
    '<rootDir>/apps/',
    '<rootDir>/libs/',
    '<rootDir>/dist/'
  ]
};
