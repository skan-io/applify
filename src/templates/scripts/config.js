import {writeFile} from 'fs';
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
    // e.g. `npm run --build-commit=<SHA> [webpack | build]`
    return `dev-${gitHead.slice(0, SHORT_SHA_LEN)}-${now}`;
  }

  return buildCommitParam || gitHead;
};


const getDeploymentEnv = async (argv)=> {
  const [deployEnv, deployPath] = argv['deploy-env'].split('/');

  if (deployEnv === 'auto') {
    return {deployEnv: `www.leaseplease.com`, deployPath: 'manage'};
  }

  return {deployEnv, deployPath: deployPath || 'manage'};
};


const main = async (process)=> {
  const {argv} = yargs(process.argv.slice(2))
    .usage('$0 [args]')
    .option('build-commit', {
      describe: 'The version to use, or a generated one using `auto`.',
      defaultDescription: 'current git commit'
    })
    .option('deploy-env', {
      describe: 'The environment to deploy to.',
      default: 'www.leaseplease.com/manage'
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
    deployUrl: `https://${deployEnv}/${deployPath}/`,
    artifactPath: `.pkg/${deployPath}/${buildCommit}`
  }, null, 2);

  mkdir(buildDir);
  await promised(writeFile)(confifgPath, data);

  // eslint-disable-next-line no-console
  console.log(`generated ${confifgPath}:\n${data}`);
};

if (require.main === module) {
  // we want to fail the process when async calls fail.
  process.on('unhandledRejection', (err)=> throw err);
  main(process);
}
