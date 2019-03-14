/* eslint max-len: 0*/
import {parseArrayString} from '../utils';


export const createBabelConfigTask = (store)=> `/* eslint no-undef: 0 */
/* eslint comma-spacing: 0 */

const configFunc = require('@skan-io/babel-config-react');

module.exports = {
  ...configFunc.default(
    ${store.answers.useJest ? 'true' : 'false'}, // Use jest testing env
    '${store.answers.nodeTarget}', // Node version to target
    [${parseArrayString(store.answers.browserTargets).array.map((target)=> `'${target}'`).toString()}], // Browser targets
    ['last 1 Chrome versions'], // Development browser targets
    [${parseArrayString(store.answers.babelPlugins).array.map((plugin)=> `'${plugin}'`).toString()}] // Extra babel plugins
  )
};
`;
