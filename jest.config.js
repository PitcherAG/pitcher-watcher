module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  prettierPath: '<rootDir>/node_modules/prettier',
  testMatch: ['**/?(*.)+(spec).[jt]s?(x)'],
  moduleFileExtensions: ['js', 'vue'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '.*\\.(js)$': 'babel-jest',
    '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!vuetify)',
    '/node_modules/(?!@pitcher/core)',
    '/node_modules/(?!@pitcher/i18n)',
    '/node_modules/(?!@pitcher/pitcherify)',
  ],
  moduleDirectories: ['node_modules', 'src'],
  setupFiles: ['<rootDir>/tests/config/jest.setEnvVars.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/config/jest.setup.js'],
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/index.js', // No need to cover bootstrap file
    '!**/node_modules/**',
  ],
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  snapshotResolver: '<rootDir>/tests/config/jest.snapshotResolver.js',
}
