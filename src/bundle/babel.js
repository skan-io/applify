import {execute} from '../exec';
import {printWarning} from '../print';


/* eslint max-len: 0 */


export const installBabelDependencies = async ()=> {
  printWarning('...please wait. This may take a few minutes...');

  await execute(
    `npm i -D @babel/cli @babel/core @babel/node @babel/plugin-proposal-class-properties @babel/plugin-proposal-decorators @babel/plugin-proposal-numeric-separator @babel/plugin-proposal-optional-catch-binding @babel/plugin-proposal-throw-expressions @babel/plugin-syntax-dynamic-import @babel/plugin-transform-runtime @babel/polyfill @babel/preset-env @babel/preset-react @babel/runtime babel-core babel-eslint babel-loader babel-plugin-dynamic-import-node babel-plugin-transform-amd-to-commonjs`,
    'Installing babel and @babel dependencies'
  );
};
