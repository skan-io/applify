/* eslint max-len: 0 */

export default {
  default: 'babel-node src/applify.js init',

  help: 'babel-node src/applify.js -h',

  clean: 'rimraf ./build',

  build: 'run build:*',
  ['build:babel']: "./node_modules/@babel/cli/bin/babel.js src --out-dir build/pkg --ignore '**/*.test.js'",
  ['build:files']: 'cp -R ./README.md ./LICENSE ./babel.config.js ./package.json ./src/templates build/pkg/',

  test: 'echo need test script',

  cd: 'run clean build release',
  release: 'semantic-release',

  lint: 'run lint:*',
  'lint:js': (
    'eslint --report-unused-disable-directives --ignore-path .gitignore .'
  ),
  'lint:sass': 'sass-lint --no-exit --verbose',
  'lint:md': 'remark -i .gitignore --no-stdout --use remark-lint *.md',

  jest: 'jest --runInBand --no-cache'
};
