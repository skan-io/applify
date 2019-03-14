import {sep} from 'path';
import {parseArrayString} from '../utils';

/* eslint max-len: 0 */


export const createStorybookWebpackConfigTask = ({answers})=> `/* eslint-env node */
/* eslint comma-spacing: 0 */

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
    path: resolve(__dirname, '..', ${parseArrayString(answers.buildOutputPath.split(sep)).array.map((dir)=> `'${dir}'`).toString()}),
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
};`;
