import {execute} from '../exec';
import {printWarning} from '../print';


/* eslint max-len: 0 */


export const installWebpackDependencies = async ()=> {
  printWarning('...please wait. This may take a few minutes...');

  await execute(
    `npm i -D react-entry-loader copy-webpack-plugin mini-css-extract-plugin node-sass postcss-nested autoprefixer css-loader postcss-loader sass-loader babel-loader url-loader file-loader whatwg-fetch webpack webpack-cli webpack-dev-server webpack-merge`,
    'Installing webpack and webpack server dependencies'
  );
};
