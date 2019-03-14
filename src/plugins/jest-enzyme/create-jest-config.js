/* eslint max-len: 0 */

// eslint-disable-next-line complexity
export const createJestConfigTask = ({answers})=> `/* eslint no-undef: 0 */
/* eslint no-useless-escape: 0 */

const config = require('@skan-io/jest-config-base');


module.exports = {
  ...config,

  setupFiles: [
    ...config.setupFiles${answers.useEnzyme ? `,\n    '<rootDir>/src/testing/setup.js'` : ''}
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
  collectCoverageFrom: [
    'src/**/*.js'${answers.useStorybook ? `,\n    '!src/**/*.story.js'` : ''}
  ],
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