import checkNode from 'check-node-version';
import {applifyError} from '../../error';
import {
  NODE_VERSION_ERROR,
  PKGMGR_VERSION_ERROR
} from '../../error/codes';


const NPM_VERSION_MIN = '6';
const YARN_VERSION_MIN = '1';
export const NODE_VERSION_MIN = '10';


const getDefaultVersion = (manager, version)=> {
  if (version) {
    return version;
  }
  if (manager === 'npm') {
    return NPM_VERSION_MIN;
  }
  if (manager === 'yarn') {
    return YARN_VERSION_MIN;
  }
};


const checkNodeVersion = ()=> ({
  type: 'task',
  description: 'check node and package manager versions',
  task: async (storeCtx)=> {
    const {packageManager, packageManagerVersion} = storeCtx.answers;

    const manager = packageManager ? packageManager : 'npm';
    const version = getDefaultVersion(manager, packageManagerVersion);

    await new Promise((resolve)=> {
      checkNode(
        {
          node: `>= ${NODE_VERSION_MIN}`,
          [`${manager}`]: `${version}`
        },
        (err, results)=> {
          if (err) {
            throw new Error(err);
          }

          for (const packageName of Reflect.ownKeys(results.versions)) {
            if (!results.versions[packageName].isSatisfied) {
              if (packageName === 'node') {
                throw applifyError(
                  NODE_VERSION_ERROR.code,
                  // eslint-disable-next-line max-len
                  `${NODE_VERSION_ERROR.message}: must be >= v${NODE_VERSION_MIN}`
                );
              } else {
                throw applifyError(
                  PKGMGR_VERSION_ERROR.code,
                  // eslint-disable-next-line max-len
                  `${PKGMGR_VERSION_ERROR.message}: ${packageManager} version must be ${version}`
                );
              }
            }
          }

          resolve();
        }
      );
    });

    return {
      printSuccess: `Node and ${packageManager} versions correct`
    };
  }
});


// eslint-disable-next-line
export const checkEnvironment = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Checking shell environment',
    children: [
      checkNodeVersion()
    ]
  });

  await store.runTasks();
};
