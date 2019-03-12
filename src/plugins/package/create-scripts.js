/* eslint max-len: 0 */

export const createConfigScript = (store)=> `import {writeFile} from 'fs';
import {join} from 'path';
import {mkdir, promised} from './lib/utils';
import readPkgJson from 'read-package-json';
import yargs from 'yargs/yargs';


const SHORT_SHA_LEN = 7;


const getBuildCommit = async (process, argv)=> {
  const pkg = await promised(readPkgJson)(join(process.cwd(), 'package.json'));

  const {gitHead} = pkg;
  const buildCommitParam = argv['build-commit'];

  if (gitHead && (buildCommitParam === 'auto')) {
    const now = (new Date())
      .toISOString()
      .replace(/[-:.TZ]/g, '');
    // must be set for builds if npm can't figure out the commit SHA"
    // e.g. \`npm run --build-commit=<SHA> [webpack | build]\`
    return \`dev-\${gitHead.slice(0, SHORT_SHA_LEN)}-\${now}\`;
  }

  return buildCommitParam || gitHead;
};


const getDeploymentEnv = async (argv)=> {
  const [deployEnv, deployPath] = argv['deploy-env'].split('/');

  if (deployEnv === 'auto') {
    return {
      deployEnv: '${store.answers.deployEnv}',
      deployPath: '${store.answers.deployPath}'
    };
  }

  return {deployEnv, deployPath: deployPath || '${store.answers.deployPath}'};
};


const main = async (process)=> {
  const {argv} = yargs(process.argv.slice(2))
    .usage('$0 [args]')
    .option('build-commit', {
      describe: 'The version to use, or a generated one using \`auto\`.',
      defaultDescription: 'current git commit'
    })
    .option('deploy-env', {
      describe: 'The environment to deploy to.',
      default: '${store.answers.deployEnv}/${store.answers.deployPath}'
    })
    .options('node-env', {
      describe: 'The env to used by babel and webpack for building code.',
      default: 'production'
    })
    .option('github-token', {
      describe: 'A github token for auto reserving environments.'
    })
    .version(false)
    .help();

  const buildDir = 'build';
  const confifgPath = join(buildDir, 'config.json');

  const buildCommit = await getBuildCommit(process, argv);
  const {deployEnv, deployPath} = await getDeploymentEnv(argv);

  const data = JSON.stringify({
    version: buildCommit,
    nodeEnv: argv['node-env'],
    deployEnv,
    deployPath,
    deployUrl: \`https://\${deployEnv}/\${deployPath}/\`,
    artifactPath: \`.pkg/\${deployPath}/\${buildCommit}\`
  }, null, 2);

  mkdir(buildDir);
  await promised(writeFile)(confifgPath, data);

  // eslint-disable-next-line no-console
  console.log(\`generated \${confifgPath}:\n\${data}\`);
};

if (require.main === module) {
  // we want to fail the process when async calls fail.
  process.on('unhandledRejection', (err)=> throw err);
  main(process);
}
`;

// eslint-disable-next-line
export const createRunScript = ({answers})=> `
export default {
  default: 'run config:dev server',
  'config:dev': (
    'run config' +
    ' --build-commit=auto' +
    ' --deploy-env=localhost' +
    ' --node-env=webpack-dev'
  ),

  server: 'webpack-dev-server --progress',${answers.useStorybook ? `\n  storybook: 'run config:dev storybook:server',\n  'storybook:server': 'start-storybook -c storybook -p 6006',` : ''}${answers.useCi ? `\n\n  deploy: 'run deploy:app${answers.useCommitizen ? ' release\',' : '\','}` : ''}${answers.useCi ? '\n  [\'deploy:app\']: \'run config upload\',' : ''}${answers.useCommitizen && answers.useCi ? '\n  release: \'semantic-release pre && semantic-release post\',' : ''}

  clean: 'rimraf ./build',
  build: 'webpack --display minimal --bail',${answers.useJest ? `\n\n  test: 'run lint jest:full',` : `\n\n  test: 'run lint',`}

  lint: 'run lint:*',
  ${answers.useEslint ? `\n  'lint:js': (
    'eslint --report-unused-disable-directives --ignore-path .gitignore .'
  ),` : ''}${answers.styleChoice === 'sass' ? `\n  'lint:sass': 'sass-lint --no-exit --verbose',` : ''}\n  'lint:md': 'remark -i .gitignore --no-stdout --use remark-lint *.md'${answers.useJest ? `,\n\n  jest: 'jest --collectCoverage=false --cache=true',
  'jest:full': 'jest --verbose --runInBand --no-cache'` : ''}
}
`;
