import {join} from 'path';
import {writeFileSync} from 'fs';
import {createWebpackConfigTask} from './create-webpack-config';


export const installWebpack = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Install webpack dependencies',
    children: [
      {
        type: 'task',
        description: 'install skan-io webpack config',
        task: async (storeCtx)=> await storeCtx.packageInstaller.install(
          '@skan-io/webpack-config-base'
        )
      }
    ]
  });
};

export const createWebpackConfig = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Write weback config',
    children: [
      {
        type: 'task',
        description: 'write webpack.config.babel.js file',
        task: (storeCtx)=> {
          const webpackPath = join(
            storeCtx.workingDir, 'webpack.config.babel.js'
          );
          const webpackConfig = createWebpackConfigTask(storeCtx);

          writeFileSync(webpackPath, webpackConfig);

          return {
            printInfo: `Wrote ${webpackPath}`,
            printSuccess: webpackConfig
          };
        }
      }
    ]
  });
};
