import {join} from 'path';
import {writeFileSync} from 'fs';
import {createJestConfigTask} from './create-jest-config';
import {createDirectory, addResourceFromTemplate} from '../utils';


export const installTestingDependecies = async (store)=> {
  const task = {
    type: 'batch',
    description: 'Install jest and enzyme dependencies',
    children: [
      {
        type: 'task',
        description: 'install skan-io jest base config',
        task: async (storeCtx)=> await storeCtx.packageInstaller.install(
          '@skan-io/jest-config-base react-test-renderer'
        )
      }
    ]
  };

  if (store.answers.useEnzyme) {
    task.children.push({
      type: 'task',
      description: 'install enzyme dependencies',
      task: async (storeCtx)=> await storeCtx.packageInstaller.install(
        'enzyme enzyme-adapter-react-16'
      )
    });
  }

  store.addTask(task);
};

export const createJestConfig = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Write jest config',
    children: [
      {
        type: 'task',
        description: 'write jest.config.js',
        task: (storeCtx)=> {
          const jestPath = join(storeCtx.workingDir, 'jest.config.js');
          const jestConfig = createJestConfigTask(storeCtx);

          writeFileSync(jestPath, jestConfig);

          return {
            printInfo: `Wrote ${jestPath}`,
            printSuccess: jestConfig
          };
        }
      }
    ]
  });
};

export const createTestingSetupFiles = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Create jest setup files',
    children: [
      {
        type: 'task',
        description: 'create testing directory',
        task: (storeCtx)=> createDirectory(join(storeCtx.appSrcDir, 'testing'))
      },
      {
        type: 'task',
        description: 'create serializer directory',
        task: (storeCtx)=> {
          const snapshotsDir = join(storeCtx.appSrcDir, 'testing', 'snapshots');
          const serializerDir = join(snapshotsDir, 'serializer');

          createDirectory(snapshotsDir);
          return createDirectory(serializerDir);
        }
      },
      {
        type: 'task',
        description: 'copy testing template files',
        // eslint-disable-next-line max-statements
        task: (storeCtx)=> {
          addResourceFromTemplate('src/testing/mock-file.js');
          addResourceFromTemplate('src/testing/setup-framework.js');
          addResourceFromTemplate('src/testing/setup-framework.test.js');
          addResourceFromTemplate('src/testing/setup.js');
          addResourceFromTemplate('src/testing/snapshots/serializer/index.js');
          addResourceFromTemplate(
            'src/testing/snapshots/serializer/index.test.js'
          );
          addResourceFromTemplate(
            'src/testing/snapshots/serializer/shallow.js'
          );
          addResourceFromTemplate(
            'src/testing/snapshots/serializer/shallow.test.js'
          );
          addResourceFromTemplate(
            'src/testing/snapshots/serializer/utils.js'
          );
          addResourceFromTemplate(
            'src/testing/snapshots/serializer/utils.test.js'
          );
          addResourceFromTemplate(
            'src/testing/mock-scss.js',
            undefined,
            join(
              process.cwd(),
              'src',
              'testing',
              storeCtx.answers.styleChoice === 'sass'
                ? 'mock-scss.js'
                : 'mock-css.js'
            )
          );

          return {
            printInfo: `Copy testing files to ${storeCtx.appSrcDir}/testing`,
            printSuccess:
              `Copied testing files to ${storeCtx.appSrcDir}/testing`
          };
        }
      }
    ]
  });
};
