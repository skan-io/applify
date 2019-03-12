import {join} from 'path';
import {writeFileSync} from 'fs';
import {createEslintConfigTask} from './create-eslint-config';


// eslint-disable-next-line max-statements
export const installFrameworkDependencies = async (store)=> {
  const task = {
    type: 'batch',
    description: 'Install core framework dependencies',
    children: []
  };

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
