import {createDirectory} from '../../utils/fs';
import {createReadmeTasks} from './create-readme';


export const createSrcDirectory = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Create src directory',
    children: [
      {
        type: 'task',
        description: 'find or create src directory',
        task: (storeCtx)=> {
          const {appSrcDir} = storeCtx;
          return createDirectory(appSrcDir);
        }
      }
    ]
  });
};

export const createReadme = async (store)=> {
  await createReadmeTasks(store);
};
