import fs from 'fs';
import {createApplifyDirTask} from './plugins/preloader';
import {removeDirectory} from './utils/fs';


export const resetTempFiles = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Reset applify and git files',
    children: [
      createApplifyDirTask(store),
      {
        type: 'task',
        description: `clear ${store.applifyTempFile}`,
        task: ()=> {
          try {
            fs.writeFileSync(store.applifyTempFile, JSON.stringify({}));

            return {
              printInfo: `Reset ${store.applifyTempFile}`,
              printSuccess: `Reset ${store.applifyTempFile} to {}`
            };
          } catch (err) {
            return {
              printError: err
            };
          }
        }
      },
      {
        type: 'task',
        description: `remove ${store.workingDir}/.git`,
        task: async (storeCtx)=> {
          try {
            let found = false;

            await new Promise((resolve, reject)=> {
              fs.exists(`${storeCtx.workingDir}/.git`, (exists)=> {
                if (exists) {
                  fs.chmodSync(`${storeCtx.workingDir}/.git`, '777');
                  found = true;
                  try {
                    removeDirectory(`${storeCtx.workingDir}/.git`);
                    resolve();
                  } catch (err) {
                    reject(err);
                  }
                } else {
                  resolve();
                }
              });
            });


            return {
              printInfo: found ? `Removed ${store.workingDir}/.git` : undefined,
              printSuccess: found
                ? `Removed ${store.workingDir}/.git`
                : undefined
            };
          } catch (err) {
            return {
              printError: err
            };
          }
        }
      },
      {
        type: 'task',
        description: `remove all files from ${store.workingDir}`,
        task: async (storeCtx)=> {
          try {
            removeDirectory(
              `${storeCtx.workingDir}`,
              ['.applify', 'temp.json']
            );
            return {
              printInfo: `Remove all files from ${store.workingDir}`,
              printSuccess: `Removed all files from ${store.workingDir}`
            };
          } catch (err) {
            return {
              printError: err
            };
          }
        }
      }
    ]
  });

  await store.runTasks();
};
