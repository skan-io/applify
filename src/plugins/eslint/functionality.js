import {join} from 'path';
import {writeFileSync} from 'fs';
import {createEslintConfigTask} from './create-eslint-config';


export const installEslintDependencies = async (store)=> {
  const task = {
    type: 'batch',
    description: 'Install eslint dependencies',
    children: []
  };

  if (store.answers.useEslint) {
    task.children.push({
      type: 'task',
      description: 'install skan-io eslint react config',
      task: async (storeCtx)=> await storeCtx.packageInstaller.install(
        '@skan-io/eslint-config-react'
      )
    });
  }

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
