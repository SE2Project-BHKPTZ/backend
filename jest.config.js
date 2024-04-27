module.exports = {
  testMatch: ['**/*.(test|spec).js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/models/**',
    '!src/services/socket.service.js',
    '!src/socketHandler/websocket.js',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/coverage/**',
  ],
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage',
};
