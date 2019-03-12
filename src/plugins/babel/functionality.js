import {join} from 'path';
import {writeFileSync} from 'fs';
import {createBabelConfigTask} from './create-babel-config';
import {parseArrayString} from '../utils';


export const createBabelConfig = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Write babel config',
    children: [
      {
        type: 'task',
        description: 'generate babel config using store',
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

export const installBabelDependencies = async (store)=> {
  const task = {
    type: 'batch',
    description: 'Install babel dependencies',
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

  store.addTask(task);
};
