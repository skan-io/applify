import {join} from 'path';
import {writeFileSync} from 'fs';
import {parseArrayString} from '../utils';
import {createBabelConfigTask} from './create-babel-config';
import {createEslintConfigTask} from './create-eslint-config';


// eslint-disable-next-line max-statements
export const installCoreLanguageDeps = async (store)=> {
  const task = {
    type: 'batch',
    description: 'Install core language dependencies',
    children: [
      {
        type: 'task',
        description: 'install skan-io babel react config',
        task: async (storeCtx)=> await storeCtx.packageInstaller.install(
          '@skan-io/babel-config-react'
        )
      }
    ]
  };

  if (
    store.answers.babelPlugins !== 'none'
    && store.answers.babelPlugins !== ''
  ) {
    const plugins = parseArrayString(store.answers.babelPlugins);

    if (plugins.array.length) {
      task.children.push({
        type: 'task',
        description: 'install extra babel plugins',
        task: async (storeCtx)=> await storeCtx.packageInstaller.install(
          plugins.string
        )
      });
    }
  }

  task.children.push({
    type: 'task',
    description: 'install react dependencies',
    task: async (storeCtx)=> await storeCtx.packageInstaller.install(
      'react react-dom react-device'
    )
  });

  if (store.answers.useRedux) {
    task.children.push({
      type: 'task',
      description: 'install redux dependencies',
      task: async (storeCtx)=> await storeCtx.packageInstaller.install(
        'react-redux redux redux-responsive redux-thunk'
      )
    });
  }

  if (store.answers.useRouter) {
    task.children.push({
      type: 'task',
      description: 'install router dependencies',
      task: async (storeCtx)=> await storeCtx.packageInstaller.install(
        // eslint-disable-next-line max-len
        `react-router ${storeCtx.answers.useRedux ? 'connected-react-router' : ''}`
      )
    });
  }

  if (store.answers.useEslint) {
    task.children.push({
      type: 'task',
      description: 'install skan-io eslint react config',
      task: async (storeCtx)=> await storeCtx.packageInstaller.install(
        '@skan-io/eslint-config-react'
      )
    });
  }

  task.children.push({
    type: 'task',
    description: 'install skan-io markdown lint config',
    task: async (storeCtx)=> await storeCtx.packageInstaller.install(
      '@skan-io/remark-config'
    )
  });

  store.addTask(task);
};

export const createBabelConfig = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Write babel config',
    children: [
      {
        type: 'task',
        description: 'configure babel config using store',
        task: (storeCtx)=> {
          const babelPath = join(storeCtx.workingDir, 'babel.config.js');
          const babelConfig = createBabelConfigTask(store);

          writeFileSync(babelPath, babelConfig);

          return {
            printInfo: `Wrote ${babelPath}`,
            printSuccess: babelConfig
          };
        }
      }
    ]
  });
};

export const createEslintConfig = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Write eslint config',
    children: [
      {
        type: 'task',
        description: 'write .eslintrc file',
        task: (storeCtx)=> {
          const eslintPath = join(storeCtx.workingDir, '.eslintrc');
          const eslintConfig = createEslintConfigTask();

          writeFileSync(eslintPath, eslintConfig);

          return {
            printInfo: `Wrote ${eslintPath}`,
            printSuccess: eslintConfig
          };
        }
      }
    ]
  });
};
