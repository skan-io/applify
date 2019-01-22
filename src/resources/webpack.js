/* eslint-env node */
/* eslint no-console: 0 */
import {resolve, relative} from 'path';
import ReactEntryLoaderPlugin from 'react-entry-loader/plugin';
import reactEntry from 'react-entry-loader/entry';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import storybook from '@storybook/core/dist/server/middleware';

import {version, deployPath, deployUrl, nodeEnv} from './build/config';

export default ()=> {
  const isProduction = (nodeEnv === 'production');
  const appUrl = deployUrl;

  console.log(`
    Running webpack with config from '.build/config.json':
    NODE_ENV=${nodeEnv}
    version=${version}
    app-url=${appUrl}
  `);

  return {
    mode: isProduction ? 'production' : 'development',
    entry: {
      app: [
        '@babel/polyfill',
        reactEntry({
          output: 'index.html',
          appUrl,
          version
        })('./src/index.html.js')
      ],
      silent: [
        '@babel/polyfill',
        reactEntry({output: 'silent_renew.html'})('./src/silent_renew.html.js')
      ]
    },

    output: {
      path: resolve(__dirname, 'build/pkg'),
      filename: '[name]-[contenthash].js',
      // improve paths in devtools
      devtoolModuleFilenameTemplate: (info)=> (
        `webpack:///${relative(__dirname, info.absoluteResourcePath)}`
      )
    },

    optimization: {
      minimize: isProduction,
      runtimeChunk: {name: 'runtime'},
      splitChunks: {
        chunks: 'all',
        name: !isProduction,
        cacheGroups: {
          default: false,
          react: {
            test: /[\\/]node_modules[\\/]react/,
            name: 'react',
            chunks: 'all'
          }
        }
      }
    },

    plugins: [
      new ReactEntryLoaderPlugin(),
      new CopyWebpackPlugin([{from: 'src/share-img.png'}]),
      new CopyWebpackPlugin([{from: 'src/favicon.png'}]),
      new MiniCssExtractPlugin({chunkFilename: '[name]-[contenthash].css'})
    ],

    module: {
      // Suppress warnings from Cesium which uses dynamic 'require'
      unknownContextCritical: false,

      rules: [{
        test: /(\.scss|\.css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: false,
              sourceMap: !isProduction,
              importLoaders: 2,
              localIdentName: '[name]',
              camelCase: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: ()=> [
                require('postcss-nested')({ /* options */ }),
                require('autoprefixer')
              ],
              sourceMap: !isProduction
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: !isProduction,
              // adds app-theme overrides to component's custom themes
              // data: '@import "src/app.theme.scss";',
              includePaths: [
                resolve(__dirname),
                resolve(__dirname, './node_modules')
              ]
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|jpeg|svg|ico|gif|ttf|eot|woff|woff2)$/,
        loader: 'url-loader?limit=10000'
      }, {
        test: /\.jsx?$/,
        include: [
          resolve(__dirname, 'node_modules/react-entry-loader'),
          resolve(__dirname, 'node_modules/refocus'),
          resolve(__dirname, 'src')
        ],
        loader: 'babel-loader',
        options: {
          // making sure babel gets the right environment and thus
          // picks up the correct config.
          envName: nodeEnv
        }
      }]
    },
    devtool: isProduction ? false : '#cheap-module-source-map',
    devServer: {
      port: 8080,
      host: '0.0.0.0',
      inline: true,
      stats: 'minimal',
      contentBase: './build',
      publicPath: `/`,
      historyApiFallback: {
        rewrites: [
          {from: /^\/$/, to: `/`},
          {from: /^\/stories\/?$/, to: '/stories/index.html'}
        ]
      },
      before: async (app)=> {
        const configDir = resolve(__dirname, 'storybook');
        const router = await storybook({configDir});
        app.use(router);
      }
    }
  };
};
