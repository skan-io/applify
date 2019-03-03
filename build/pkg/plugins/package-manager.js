"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = exports.init = exports.checkRestore = exports.requiredAnswers = exports.requiredFields = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = require("path");

var _execute = require("../execute");

var _events = require("../events");

var _utils = require("./utils");

var _strings = require("../utils/strings");

var _createScripts = require("./create-scripts");

const requiredFields = [];
exports.requiredFields = requiredFields;
const requiredAnswers = [];
exports.requiredAnswers = requiredAnswers;

const getDepFlag = (manager, type) => {
  if (type === 'dev') {
    return ' -D ';
  }

  if (type === 'global' && manager === 'npm') {
    return ' -g ';
  }

  return ' ';
};

const attachPackageInstaller = store => {
  store.packageInstaller = {
    install: async (pkg, type = 'dev') => {
      const depFlag = getDepFlag(store.answers.packageManager, type);
      const cmd = store.answers.packageManager === 'npm' || store.answers.packageManager === undefined ? `npm i${depFlag}${pkg}` : `yarn${type === 'global' ? ' global ' : ' '}add${depFlag}${pkg}`;
      return await (0, _execute.execute)({
        cmd,
        info: `Install${type === 'peer' ? ' ' : ` ${type} `}dependency ${pkg}`
      });
    },
    remove: async pkg => {
      const cmd = store.answers.packageManager === 'npm' ? `npm uninstall ${pkg}` : `yarn remove ${pkg}`;
      return await (0, _execute.execute)({
        cmd,
        info: `Removing dependency ${pkg}`
      });
    }
  };
}; // eslint-disable-next-line max-statements


const writeInitialPackageJson = store => {
  const json = {};
  json.name = (0, _utils.getScopedProject)(store.answers.orgScope, store.answers.projectName);
  json.private = store.answers.privatePackage;
  json.version = store.answers.useCommitizen ? '0.0.0-semantically-released' : '1.0.0';
  json.description = store.answers.projectDescription;
  json.engines = {
    node: '>=10.0.0'
  };
  json.repository = store.answers.useGit ? {
    type: 'git',
    url: `git+${store.gitHtmlUrl}`
  } : undefined;
  json.author = store.answers.projectAuthor;
  json.license = store.answers.projectLicense;
  json.homepage = store.answers.useGit ? `${store.gitHtmlUrl}#readme` : undefined;
  json.bugs = store.answers.useGit ? `${store.gitHtmlUrl}/issues` : undefined;
  json.publishConfig = store.answers.privatePackage ? undefined : {
    access: 'public'
  };
  const stringifiedJson = (0, _strings.stringify)(json);

  _fs.default.writeFileSync(store.packageJsonFile, stringifiedJson);

  return stringifiedJson;
};

const runPackageInitialisationTasks = async store => {
  const task = {
    type: 'batch',
    description: store.preloaded ? 'Reinitialise package installer' : 'Initialise package installer and package.json',
    children: [{
      type: 'task',
      description: 'attach package installer',
      task: storeCtx => {
        attachPackageInstaller(storeCtx);
        storeCtx.packageInstallerAttached = true;
        return {
          printInfo: 'Attached package installer to store'
        };
      }
    }]
  };

  if (!store.preloaded) {
    task.children.push({
      type: 'task',
      description: 'write initial package.json',
      task: storeCtx => {
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
        task: async storeCtx => {
          if (!storeCtx.npxRunInstalled) {
            const output = await storeCtx.packageInstaller.install('npx-run');
            store.npxRunInstalled = true;
            return output;
          }
        }
      });
    }
  }

  store.addTask(task);
};

const installSupportTools = async store => {
  store.addTask({
    type: 'batch',
    description: 'Install package support tools',
    children: [{
      type: 'task',
      description: 'install rimraf, read-package-json and yargs',
      task: async storeCtx => {
        const output = await storeCtx.packageInstaller.install('rimraf read-package-json yargs');
        return output;
      }
    }]
  });
};

const createScriptsDirectory = async store => {
  store.addTask({
    type: 'batch',
    description: 'Create package run scripts',
    children: [{
      type: 'task',
      description: `create ${store.runScriptsDir} directory`,
      task: storeCtx => {
        const {
          runScriptsDir
        } = storeCtx;
        let printSuccess = `Found ${runScriptsDir}`;

        if (!_fs.default.existsSync(runScriptsDir)) {
          _fs.default.mkdirSync(runScriptsDir);

          printSuccess = `Created ${runScriptsDir}`;
        }

        return {
          printInfo: `Find or create local scripts directory`,
          printSuccess
        };
      }
    }, {
      type: 'task',
      description: 'copy run script lib templates',
      task: storeCtx => {
        let printInfo = 'Copied scripts/lib/utils.js scripts/lib/walk.js';
        (0, _utils.addResourceFromTemplate)('scripts/lib/utils.js');
        (0, _utils.addResourceFromTemplate)('scripts/lib/walk.js');

        if (storeCtx.answers.useStorybook) {
          (0, _utils.addResourceFromTemplate)('scripts/lib/find-files.js');
          printInfo += ' scrips/lib/find-files.js';
        }

        return {
          printInfo
        };
      }
    }, {
      type: 'task',
      description: 'write config script',
      task: storeCtx => {
        const configScript = (0, _createScripts.createConfigScript)(storeCtx);
        const configScriptPath = (0, _path.join)(storeCtx.runScriptsDir, 'config.js');

        _fs.default.writeFileSync(configScriptPath, configScript);

        return {
          printInfo: `Wrote ${configScriptPath}`,
          printSuccess: configScript
        };
      }
    }, {
      type: 'task',
      description: 'write run script',
      task: storeCtx => {
        const runScriptPath = (0, _path.join)(storeCtx.runScriptsDir, 'index.js');
        const runScript = (0, _createScripts.createRunScript)(storeCtx);

        _fs.default.writeFileSync(runScriptPath, runScript);

        return {
          printInfo: `Wrote ${runScriptPath}`,
          printSuccess: runScript
        };
      }
    }]
  });
};

const checkRestore = async store => {
  // eslint-disable-next-line
  await init(store);
};

exports.checkRestore = checkRestore;

const init = async store => {
  store.emit(_events.STEP_COMPLETE, 'init:package');
  store.completedSteps.push('init:package');
};

exports.init = init;

const run = async store => {
  if (!store.completedSteps.some(step => step === 'run:package')) {
    await runPackageInitialisationTasks(store);
    await installSupportTools(store);
    await createScriptsDirectory(store);
  }

  store.emit(_events.STEP_COMPLETE, 'run:package');
  store.completedSteps.push('run:package');
  return () => Promise.resolve(null);
};

exports.run = run;