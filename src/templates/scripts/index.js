export default {
  default: 'run config:dev server',
  'config:dev': (
    'run config' +
    ' --build-commit=auto' +
    ' --deploy-env=localhost' +
    ' --node-env=webpack-dev'
  ),

  server: 'webpack-dev-server --progress',

  storybook: 'run config:dev storybook:server',
  'storybook:server': 'start-storybook -c storybook -p 6006',

  clean: 'rimraf ./build',
  build: 'webpack --display minimal --bail',

  test: 'run lint jest:full',

  deploy: `echo "need deploy script"`,

  cd: `echo "need cd script"`,

  lint: 'run lint:*',
  'lint:js': (
    'eslint --report-unused-disable-directives --ignore-path .gitignore .'
  ),
  'lint:sass': 'sass-lint --no-exit --verbose',
  'lint:md': 'remark -i .gitignore --no-stdout --use remark-lint *.md',

  jest: 'jest --collectCoverage=false --cache=true',
  'jest:full': 'jest --verbose --runInBand --no-cache'
};
