import fs from 'fs';
import {execute} from '../execute';
import {STEP_COMPLETE} from '../events';
import {getScopedProject} from './utils';
import {stringify} from '../utils/strings';


export const requiredFields = ['packageInstallerAttached', 'packageJsonExists'];

export const requiredAnswers = [];


const attachPackageInstaller = (store)=> {
  store.packageInstaller = {
    install: async (pkg, devDep=true)=> {
      const cmd = (
        store.answers.packageManager === 'npm'
        || store.answers.packageManager === undefined
      )
        ? `npm i ${devDep ? '-D' : ''} ${pkg}`
        : `yarn add ${devDep ? '-D' : ''} ${pkg}`;

      return await execute({
        cmd,
        info: `Install ${devDep ? 'dev' : ''} dependency ${pkg}`
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
  store.addTask({
    type: 'batch',
    description: 'Initialise package.json and packageInstaller',
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
      },
      {
        type: 'task',
        description: 'write initial package.json',
        task: (storeCtx)=> {
          if (!store.packageJsonExists) {
            const stringifiedJson = writeInitialPackageJson(storeCtx);

            storeCtx.packageJsonExists = true;

            return {
              printInfo: 'Wrote intial package.json',
              printSuccess: stringifiedJson
            };
          }

          return {};
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

  store.emit(STEP_COMPLETE, 'init:package');
  store.completedSteps.push('init:package');
};

// TODO run - create the scripts directory, install basic tools (rimraf, npx-run)
