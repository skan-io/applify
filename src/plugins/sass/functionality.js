import {join} from 'path';
import {writeFileSync} from 'fs';
import {createSassLintConfigTask} from './create-sass-config';


export const installSassDependencies = async (store)=> {
  const task = {
    type: 'batch',
    description: 'Install sass lint dependencies',
    children: []
  };

  task.children.push({
    type: 'task',
    description: 'install skan-io markdown lint config',
    task: async (storeCtx)=>
      await storeCtx.packageInstaller.install('sass-lint')
  });

  store.addTask(task);
};

export const createSassLintConfig = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Write sass lint config',
    children: [
      {
        type: 'task',
        description: 'write .sass-lint.yml file',
        task: (storeCtx)=> {
          const configFile = join(storeCtx.workingDir, '.sass-lint.yml');
          const configString = createSassLintConfigTask();

          writeFileSync(configFile, configString);

          return {
            printInfo: `Wrote ${configFile}`,
            printSuccess: configString
          };
        }
      }
    ]
  });
};
