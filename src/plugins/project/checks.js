import {execute} from '../../execute';
import {applifyError} from '../../error';
import {
  NODE_VERSION_ERROR,
  PKGMGR_VERSION_ERROR
} from '../../error/codes';


const NPM_VERSION_MIN = '6';
const YARN_VERSION_MIN = '1';
const NODE_VERSION_MIN = 'v10';


const getNodeVersionCheckTask = ()=> ({
  type: 'task',
  description: 'checking node version',
  task: async (storeCtx)=> {
    const output = await execute({cmd: 'node -v', info: 'Node version'});
    const {result} = output;

    if (!result.stdout.startsWith(NODE_VERSION_MIN)) {
      throw applifyError(
        NODE_VERSION_ERROR.code,
        // eslint-disable-next-line max-len
        `${NODE_VERSION_ERROR.message}: failed with ${result.stdout} (must be ${NODE_VERSION_MIN}+)`
      );
    }
    if (result.stderr) {
      throw applifyError(
        NODE_VERSION_ERROR.code,
        `${NODE_VERSION_ERROR.message}: failed with ${result.stderr}`
      );
    }

    storeCtx.nodeVersionConfirmed = true;
    return output;
  }
});

const runYarnCheck = async ()=> {
  const output = await execute({cmd: 'yarn -v', info: 'Yarn version'});
  const {result} = output;

  if (!result.stdout.startsWith(YARN_VERSION_MIN)) {
    throw applifyError(
      PKGMGR_VERSION_ERROR.code,
      // eslint-disable-next-line max-len
      `${PKGMGR_VERSION_ERROR.message}: failed with ${result.stdout} (must be v${YARN_VERSION_MIN}+)`
    );
  }
  if (result.stderr) {
    throw applifyError(
      PKGMGR_VERSION_ERROR.code,
      `${PKGMGR_VERSION_ERROR.message}: failed with ${result.stderr}`
    );
  }

  return output;
};

const runNpmCheck = async ()=> {
  const output = await execute({cmd: 'npm -v', info: 'NPM version'});
  const {result} = output;

  if (!result.stdout.startsWith(NPM_VERSION_MIN)) {
    throw applifyError(
      PKGMGR_VERSION_ERROR.code,
      // eslint-disable-next-line
      `${PKGMGR_VERSION_ERROR.message}: failed with ${result.stdout} (must be v${NPM_VERSION_MIN}+)`
    );
  }
  if (result.stderr) {
    throw applifyError(
      PKGMGR_VERSION_ERROR.code,
      // eslint-disable-next-line
      `${PKGMGR_VERSION_ERROR.message}: failed with ${result.stderr}`
    );
  }

  return output;
};

const getPackageManagerCheckTask = (store)=> ({
  type: 'task',
  description: `checking ${store.answers.packageManager} version`,
  task: async (storeCtx)=> {
    let output = null;
    const {packageManager} = storeCtx.answers;

    if (packageManager === 'npm') {
      output = await runNpmCheck();
    }
    if (packageManager === 'yarn') {
      output = await runYarnCheck();
    }

    storeCtx.packageManagerVersionConfirmed = true;
    return output;
  }
});

// eslint-disable-next-line
export const checkEnvironment = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Checking shell environment',
    children: [
      getNodeVersionCheckTask(),
      getPackageManagerCheckTask(store)
    ]
  });

  await store.runTasks();
};
