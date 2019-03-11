import {join} from 'path';
import {writeFileSync} from 'fs';
import {execute} from '../../execute';
import {createDirectory, addResourceFromTemplate} from '../../utils/fs';
import {createPackageJson} from './create-package-json.js';
import {createConfigScript, createRunScript} from './create-scripts';


const getDepFlag = (manager, type)=> {
  if (type === 'dev') {
    return ' -D ';
  }
  if (type === 'global' && manager === 'npm') {
    return ' -g ';
  }

  return ' ';
};

const setupPckageInstaller = (store)=> {
  store.packageInstaller = {
    install: async (pkg, type='dev')=> {
      const depFlag = getDepFlag(
        store.answers.packageManager, type
      );

      const cmd = (
        store.answers.packageManager === 'npm'
        || store.answers.packageManager === undefined
      )
        ? `npm i${depFlag}${pkg}`
        : `yarn${type === 'global' ? ' global ' : ' '}add${depFlag}${pkg}`;

      return await execute({
        cmd,
        info: `Install${type === 'peer' ? ' ' : ` ${type} `}dependency ${pkg}`
      });
    },
    remove: async (pkg)=> {
      const cmd = store.answers.packageManager === 'npm'
        ? `npm uninstall ${pkg}`
        : `yarn remove ${pkg}`;

      return await execute({
        cmd,
        info: `Removing dependency ${pkg}`
      });
    }
  };
};

export const attachPackageInstaller = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Initialise package installer',
    children: [
      {
        type: 'task',
        description: 'attach package installer',
        task: (storeCtx)=> {
          setupPckageInstaller(storeCtx);

          storeCtx.packageInstallerAttached = true;

          return {
            printInfo: 'Attached package installer to store'
          };
        }
      }
    ]
  });
};

export const initialisePackageJson = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Initialise package.json',
    children: [
      {
        type: 'task',
        description: 'write initial package.json',
        task: (storeCtx)=> {
          const stringifiedJson = createPackageJson(storeCtx);
          writeFileSync(store.packageJsonFile, stringifiedJson);

          storeCtx.packageJsonExists = true;

          return {
            printInfo: `Wrote ${store.packageJsonFile}`,
            printSuccess: stringifiedJson
          };
        }
      }
    ]
  });
};

export const installSupportTools = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Install package support tools',
    children: [
      {
        type: 'task',
        description: 'install npx-run',
        task: async (storeCtx)=> await storeCtx.packageInstaller.install(
          'npx-run'
        )
      },
      {
        type: 'task',
        description: 'install rimraf, read-package-json and yargs',
        task: async (storeCtx)=> await storeCtx.packageInstaller.install(
          'rimraf read-package-json yargs'
        )
      }
    ]
  });
};

export const createPackageScripts = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Create package scripts',
    children: [
      {
        type: 'task',
        description: `create ${store.runScriptsDir} directory`,
        task: (storeCtx)=> createDirectory(storeCtx.runScriptsDir)
      },
      {
        type: 'task',
        description: `create ${store.runScriptsDir}/lib directory`,
        task: (storeCtx)=> createDirectory(join(storeCtx.runScriptsDir, 'lib'))
      },
      {
        type: 'task',
        description: 'copy run script lib templates',
        task: (storeCtx)=> {
          let printSuccess = `Wrote ${storeCtx.runScriptsDir}/lib/utils.js`;
          printSuccess += `  ${storeCtx.runScriptsDir}/lib/walk.js`;

          addResourceFromTemplate('scripts/lib/utils.js');
          addResourceFromTemplate('scripts/lib/walk.js');

          if (storeCtx.answers.useStorybook) {
            addResourceFromTemplate('scripts/lib/find-files.js');
            printSuccess += `${storeCtx.runScriptsDir}/lib/find-files.js`;
          }

          return {
            printInfo: 'Write run script library files',
            printSuccess
          };
        }
      },
      {
        type: 'task',
        description: 'write config script',
        task: (storeCtx)=> {
          const configScript = createConfigScript(storeCtx);
          const configScriptPath = join(storeCtx.runScriptsDir, 'config.js');
          writeFileSync(configScriptPath, configScript);

          return {
            printInfo: `Wrote ${configScriptPath}`,
            printSuccess: configScript
          };
        }
      },
      {
        type: 'task',
        description: 'write run script',
        task: (storeCtx)=> {
          const runScriptPath = join(storeCtx.runScriptsDir, 'index.js');
          const runScript = createRunScript(storeCtx);
          writeFileSync(runScriptPath, runScript);

          return {
            printInfo: `Wrote ${runScriptPath}`,
            printSuccess: runScript
          };
        }
      }
    ]
  });
};
