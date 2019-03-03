"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createJestConfig = void 0;

/* eslint max-len: 0 */
const createJestConfig = ({
  answers
}) => `const config = require('@skan-io/jest-config-base');

module.exports = {
  ...config,

  setupFiles: [
    ...config.setupFiles,
    '<rootDir>/src/testing/setup.js'
  ],

  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.story.js'
  ],

  setupFilesAfterEnv: ['<rootDir>/src/testing/setup-framework.js'],

  moduleNameMapper: {
    '^.*\\.${answers.styleChoice === 'sass' ? 'scss' : 'css'}$': '<rootDir>/src/testing/mock-${answers.styleChoice === 'sass' ? 'scss' : 'css'}.js'
  },

  transform: {
    ...config.transform,
    '^.*\\.(png|gif|svg|jpg|jpeg)$': '<rootDir>/src/testing/mock-file.js'
  },

  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(refocus)/).*'
  ],

  globals: {
    ...config.globals${answers.useStorybook ? `,\n    STORYBOOK_IMPORT_ENV: 'jest'` : ''}
  },

  snapshotSerializers: [
    '<rootDir>/src/testing/snapshots/serializer'
  ],

  collectCoverage: ${answers.useCodeCoverage},
  collectCoverageFrom: ['src/**/*.js'],
  coverageDirectory: './build/cov',
  coverageReporters: ['lcov'],
  coverageThreshold: {
    global: {
      branches: ${answers.useCodeCoverage ? answers.branchesPercentageCoverage : 0},
      functions: ${answers.useCodeCoverage ? answers.functionsPercentageCoverage : 0},
      lines: ${answers.useCodeCoverage ? answers.linesPercentageCoverage : 0},
      statements: ${answers.useCodeCoverage ? answers.statementsPercentageCoverage : 0}
    }
  }
};
`;

exports.createJestConfig = createJestConfig;