import {join} from 'path';
import {writeFileSync} from 'fs';
import {createDirectory, addResourceFromTemplate} from '../../utils/fs';
import {createStorybookWebpackConfigTask} from './create-storybook-config';
import {
  createHelpersFileTask,
  createHelpersTestFileTask
} from './create-stories-helpers';


export const installStorybook = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Install storybook dependencies',
    children: [
      {
        type: 'task',
        description: 'install storybook and storybook addons',
        task: async (storeCtx)=> await storeCtx.packageInstaller.install(
          // TODO: make this a skan-io config
          // eslint-disable-next-line
          '@storybook/react @storybook/addons @storybook/addon-storyshots @storybook/addon-links @storybook/addon-knobs @storybook/addon-info @storybook/addon-actions'
        )
      }
    ]
  });
};

export const copyStorybookTemplateFiles = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Create storybook setup files',
    children: [
      {
        type: 'task',
        description: 'create storybook directory',
        task: (storeCtx)=>
          createDirectory(join(storeCtx.workingDir, 'storybook'))
      },
      {
        type: 'task',
        description: 'copy storybook template files',
        // eslint-disable-next-line max-statements
        task: (storeCtx)=> {
          addResourceFromTemplate('storybook/addons.js');
          addResourceFromTemplate('storybook/config.js');
          addResourceFromTemplate('storybook/fs-mock.js');

          return {
            printInfo:
              `Copy storybook files to ${storeCtx.workingDir}/storybook`,
            printSuccess:
              `Copied storybook files to ${storeCtx.workingDir}/storybook`
          };
        }
      }
    ]
  });
};

export const writeStorybookWebpackConfig = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Write storybook webpack config',
    children: [
      {
        type: 'task',
        description: 'write storybook webpack.config.babel.js file',
        task: (storeCtx)=> {
          const webpackPath = join(
            storeCtx.workingDir, 'storybook', 'webpack.config.babel.js'
          );
          const webpackConfig = createStorybookWebpackConfigTask(storeCtx);

          writeFileSync(webpackPath, webpackConfig);

          return {
            printInfo: `Write ${webpackPath}`,
            printSuccess: webpackConfig
          };
        }
      }
    ]
  });
};

export const writeStorybookHelpers = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Write stories helper files',
    children: [
      {
        type: 'task',
        description: 'create stories directory',
        task: (storeCtx)=> createDirectory(join(storeCtx.appSrcDir, 'stories'))
      },
      {
        type: 'task',
        description: 'write stories helpers.js file',
        task: (storeCtx)=> {
          const helpersFile = join(
            storeCtx.appSrcDir, 'stories', 'helpers.js'
          );
          const helpersTestFile = join(
            storeCtx.appSrcDir, 'stories', 'helpers.test.js'
          );

          const helpersFileString = createHelpersFileTask(store);
          const helpersTestFileString = createHelpersTestFileTask(store);

          writeFileSync(helpersFile, helpersFileString);
          writeFileSync(helpersTestFile, helpersTestFileString);

          const helpersThemePath = storeCtx.answers.styleChoice === 'sass'
            ? 'src/stories/theme.scss'
            : 'src/stories/theme.css';

          addResourceFromTemplate(helpersThemePath);

          return {
            printInfo: `Write ${join(storeCtx.appSrcDir, 'stories')} helpers`,
            printSuccess: `Wrote ${join(storeCtx.appSrcDir, 'stories')} helpers`
          };
        }
      }
    ]
  });
};
