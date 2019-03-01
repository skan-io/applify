import fs from 'fs';
import {join} from 'path';
import {execute} from '../execute';
import {STEP_COMPLETE} from '../events';
import {getScopedProject, addResourceFromTemplate} from './utils';
import {stringify} from '../utils/strings';
import {createConfigScript, createRunScript} from './create-scripts';


export const requiredFields = [
  'packageInstallerAttached', 'packageJsonExists', 'npxRunInstalled'
];

export const requiredAnswers = [];

const getDepFlag = (manager, type)=> {
  if (type === 'dev') {
    return ' -D ';
  }
  if (type === 'global' && manager === 'npm') {
    return ' -g ';
  }

  return ' ';
};

const attachPackageInstaller = (store)=> {
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

// eslint-disable-next-line max-statements
const writeInitialPackageJson = (store)=> {
  const json = {};
  json.name = getScopedProject(
    store.answers.orgScope, store.answers.projectName
  );
  json.private = store.answers.privatePackage;
  json.version = store.answers.useCommitizen
    ? '0.0.0-semantically-released'
    : '1.0.0';
  json.description = store.answers.projectDescription;
  json.engines = {node: '>=10.0.0'};
  json.repository = store.answers.useGit ? {
    type: 'git',
    url: `git+${store.gitHtmlUrl}`
  } : undefined;
  json.author = store.answers.projectAuthor;
  json.license = store.answers.projectLicense;
  json.homepage = store.answers.useGit
    ? `${store.gitHtmlUrl}#readme`
    : undefined;
  json.bugs = store.answers.useGit
    ? `${store.gitHtmlUrl}/issues`
    : undefined;
  json.publishConfig = store.answers.privatePackage
    ? undefined
    : {access: 'public'};

  const stringifiedJson = stringify(json);

  fs.writeFileSync(store.packageJsonFile, stringifiedJson);

  return stringifiedJson;
};

const runPackageInitialisationTasks = async (store)=> {
  const task = {
    type: 'batch',
    description: store.preloaded
      ? 'Reinitialise package installer'
      : 'Initialise package installer and package.json',
    children: [
      {
        type: 'task',
        description: 'attach package installer',
        task: (storeCtx)=> {
          attachPackageInstaller(storeCtx);

          storeCtx.packageInstallerAttached = true;

          return {
            printInfo: 'Attached package installer to store'
          };
        }
      }
    ]
  };

  if (!store.preloaded) {
    task.children.push({
      type: 'task',
      description: 'write initial package.json',
      task: (storeCtx)=> {
        if (!storeCtx.packageJsonExists) {
          const stringifiedJson = writeInitialPackageJson(storeCtx);

          storeCtx.packageJsonExists = true;

          return {
            printInfo: 'Wrote intial package.json',
            printSuccess: stringifiedJson
          };
        }

        return {};
      }
    });

    if (store.answers.packageManager === 'npm') {
      task.children.push({
        type: 'task',
        description: 'install npx-run',
        task: async (storeCtx)=> {
          if (!storeCtx.npxRunInstalled) {
            const output = await storeCtx.packageInstaller.install(
              'npx-run'
            );

            store.npxRunInstalled = true;

            return output;
          }
        }
      });
    }
  }

  store.addTask(task);

  await store.runTasks();
};

const installSupportTools = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Install package support tools',
    children: [
      {
        type: 'task',
        description: 'install rimraf, read-package-json and yargs',
        task: async (storeCtx)=> {
          const output = await storeCtx.packageInstaller.install(
            'rimraf read-package-json yargs'
          );

          return output;
        }
      }
    ]
  });

  await store.runTasks();
};

const createScriptsDirectory = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Create package run scripts',
    children: [
      {
        type: 'task',
        description: `create ${store.runScriptsDir} directory`,
        task: (storeCtx)=> {
          const {runScriptsDir} = storeCtx;
          let printSuccess = `Found ${runScriptsDir}`;

          if (!fs.existsSync(runScriptsDir)) {
            fs.mkdirSync(runScriptsDir);
            printSuccess = `Created ${runScriptsDir}`;
          }

          return {
            printInfo: `Find or create local scripts directory`,
            printSuccess
          };
        }
      },
      {
        type: 'task',
        description: 'copy run script lib templates',
        task: (storeCtx)=> {
          let printInfo = 'Copied scripts/lib/utils.js scripts/lib/walk.js';
          addResourceFromTemplate('scripts/lib/utils.js');
          addResourceFromTemplate('scripts/lib/walk.js');

          if (storeCtx.answers.useStorybook) {
            addResourceFromTemplate('scripts/lib/find-files.js');
            printInfo += ' scrips/lib/find-files.js';
          }

          return {
            printInfo
          };
        }
      },
      {
        type: 'task',
        description: 'write config script',
        task: (storeCtx)=> {
          const configScript = createConfigScript(storeCtx);
          const configScriptPath = join(storeCtx.runScriptsDir, 'config.js');
          fs.writeFileSync(configScriptPath, configScript);

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

          fs.writeFileSync(runScriptPath, runScript);

          return {
            printInfo: `Wrote ${runScriptPath}`,
            printSuccess: runScript
          };
        }
      }
    ]
  });

  await store.runTasks();
};

export const checkRestore = async (store)=> {
  // eslint-disable-next-line
  await init(store);
};

export const init = async (store)=> {
  await runPackageInitialisationTasks(store);

  if (!store.packageManager === 'npm') {
    store.npxRunInstalled = false;
  }

  store.emit(STEP_COMPLETE, 'init:package');
  store.completedSteps.push('init:package');
};

export const run = async (store)=> {
  if (!store.completedSteps.some((step)=> step === 'run:package')) {
    await installSupportTools(store);
    await createScriptsDirectory(store);
  }

  store.emit(STEP_COMPLETE, 'run:package');
  store.completedSteps.push('run:package');

  return ()=> Promise.resolve(null);
};
