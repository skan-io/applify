import {join} from 'path';
import {writeFileSync} from 'fs';
import {createReduxStoreTask, createReducersTask} from './create-redux-files';


// eslint-disable-next-line max-statements
export const installReactReduxDependencies = async (store)=> {
  const task = {
    type: 'batch',
    description: 'Install core react redux dependencies',
    children: []
  };

  task.children.push({
    type: 'task',
    description: 'install react dependencies',
    task: async (storeCtx)=> await storeCtx.packageInstaller.install(
      'react react-dom react-device refocus'
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

  store.addTask(task);
};

export const createReduxFiles = (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Write redux store file',
    children: [
      {
        type: 'task',
        description: 'write store.js file',
        task: (storeCtx)=> {
          const fileName = join(storeCtx.appSrcDir, 'store.js');
          const storeString = createReduxStoreTask(store);

          writeFileSync(fileName, storeString);

          return {
            printInfo: `Wrote ${fileName}`,
            printSuccess: storeString
          };
        }
      },
      {
        type: 'task',
        description: 'write reducers.js file',
        task: (storeCtx)=> {
          const fileName = join(storeCtx.appSrcDir, 'reducers.js');
          const reducersString = createReducersTask(store);

          writeFileSync(fileName, reducersString);

          return {
            printInfo: `Wrote ${fileName}`,
            printSuccess: reducersString
          };
        }
      }
    ]
  });
};
