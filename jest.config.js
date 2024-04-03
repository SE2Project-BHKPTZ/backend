module.exports = {
  testMatch: ['**/*.(test|spec).js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/models/**',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/coverage/**',
  ],
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage',
};
