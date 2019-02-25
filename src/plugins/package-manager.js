import fs from 'fs';
import {execute} from '../execute';
import {STEP_COMPLETE} from '../events';
import {getScopedProject} from './utils';
import {stringify} from '../utils/strings';


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
        // eslint-disable-next-line
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
      ? 'Reinitialise packageInstaller'
      : 'Initialise packageInstaller and package.json',
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

// TODO run - create the scripts directory, install basic tools (rimraf, npx-run)
