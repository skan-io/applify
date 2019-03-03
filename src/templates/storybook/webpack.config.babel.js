/* eslint-env node */
import mainWebpackConfig from '../webpack.config.babel';
import {resolve} from 'path';
import webpack from 'webpack';

const config = mainWebpackConfig();

export default (storybookBaseConfig)=> {
  storybookBaseConfig.mode = config.mode;
  storybookBaseConfig.module = {
    ...storybookBaseConfig.module,
    ...config.module
  };
  storybookBaseConfig.output = {
    path: resolve(__dirname, '..', 'build', 'pkg'),
    filename: '[name]-[hash].js',
    publicPath: '/stories/'
  };
  storybookBaseConfig.plugins = [
    ...storybookBaseConfig.plugins,
    ...config.plugins,
    new webpack.DefinePlugin({
      STORYBOOK_IMPORT_ENV: JSON.stringify('webpack')
    })
  ];
  storybookBaseConfig.resolve.alias = {
    ...storybookBaseConfig.resolve.alias,
    fs: resolve(__dirname, 'fs-mock.js')
  };
  return storybookBaseConfig;
};
