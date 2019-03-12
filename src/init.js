import {join} from 'path';
import {existsSync} from 'fs';
import Store from './store';
import ApplifyTaskRunnerPlugin from './plugins/tasker';
import ApplifyPromptPlugin from './plugins/prompter';
import {importConfig} from './plugins/import';
import {removeDirectory, createDirectory} from './utils/fs';
import {printNeedPlugins, newLine} from './print';
import {applifyError} from './error';
import {NO_PLUGIN_ERROR} from './error/codes';
import {progress} from './progress';
import defaultConfig from './default.config';


const NUM_INIT_TASKS = 5;

const stepProgress = (step)=> progress.update(progress.current + step);


// eslint-disable-next-line
const setFilePaths = (store)=> {
  if (!store.workingDir) {
    store.workingDir = process.cwd();
  }
  if (!store.applifyDir) {
    store.applifyDir = join(process.cwd(), '.applify');
  }
  if (!store.applifyTempFile) {
    store.applifyTempFile = join(store.applifyDir, 'temp.json');
  }
  if (!store.packageJsonFile) {
    store.packageJsonFile = join(process.cwd(), 'package.json');
  }
  if (!store.runScriptsDir) {
    store.runScriptsDir = join(process.cwd(), 'scripts');
  }
  if (!store.runScriptsLibsDir) {
    store.runScriptsLibsDir = join(process.cwd(), 'scripts', 'lib');
  }
  if (!store.appSrcDir) {
    store.appSrcDir = join(process.cwd(), 'src');
  }

  stepProgress(1);
};

const createApplifyDirectory = async (store, reset)=> {
  if (reset) {
    removeDirectory(store.applifyDir);
  }

  createDirectory(store.applifyDir);
};

const getApplifyConfigPath = (workingDir)=> {
  const configPath = join(workingDir, 'applify.config.js');

  if (existsSync(configPath)) {
    stepProgress(1);
    return {path: configPath, babel: false};
  }

  const configBabelPath = join(workingDir, 'applify.config.babel.js');

  if (existsSync(configBabelPath)) {
    stepProgress(1);
    return {path: configBabelPath, babel: true};
  }

  stepProgress(1);
  return null;
};

const findConfig = async (workingDir)=> {
  const configPath = getApplifyConfigPath(workingDir);

  if (configPath) {
    const {path, babel} = configPath;
    const config = await importConfig(path, babel);

    if (typeof config.default === 'function') {
      return await config.default();
    }

    stepProgress(1);

    return config.default;
  }

  stepProgress(1);

  return defaultConfig();
};

const checkConfig = (config)=> {
  const {plugins} = config;

  if (!plugins || !Array.isArray(plugins) || plugins.length === 0) {
    printNeedPlugins();
    throw applifyError(
      NO_PLUGIN_ERROR.code,
      `${NO_PLUGIN_ERROR.message}: plugins must be defined array in config`
    );
  }

  stepProgress(1);
};

const loadPlugins = async (config)=> {
  progress.total += config.plugins.length;
  const plugins = [];

  for (const pluginPromise of config.plugins) {
    plugins.push(await pluginPromise);
    stepProgress(1);
  }

  config.plugins = plugins;
  stepProgress(1);
};

const setStoreOperators = (store, config)=> {
  const {taskRunner, prompt} = config;

  store.tasker = taskRunner === undefined
    ? new ApplifyTaskRunnerPlugin()
    : taskRunner;

  store.prompter = prompt === undefined
    ? new ApplifyPromptPlugin()
    : prompt;

  stepProgress(1);
};

const executePluginStage = async (store, config, stage)=> {
  const postStagePromises = [];

  for (const plugin of config.plugins) {
    const stagePromise = await plugin[stage](store, config);
    postStagePromises.push(stagePromise());
  }

  await store.runTasks();

  store.emit(`${stage}-complete`);

  await store.runTasks();

  return Promise.all(postStagePromises);
};

const executePlugins = async (store, config, reset)=> {
  if (!reset) {
    await executePluginStage(store, config, 'patch');
  }

  await executePluginStage(store, config, 'check');
  await executePluginStage(store, config, 'init');
  await executePluginStage(store, config, 'run');
  await executePluginStage(store, config, 'finish');
};

// eslint-disable-next-line
export default async (reset)=> {
  const store = new Store();

  newLine();

  progress.init(NUM_INIT_TASKS);

  setFilePaths(store);

  const config = await findConfig(store.workingDir);
  checkConfig(config);
  await loadPlugins(config);

  setStoreOperators(store, config);

  await createApplifyDirectory(store, reset);

  newLine();

  await executePlugins(store, config, reset);
};
