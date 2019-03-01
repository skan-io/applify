/* eslint max-len: 0*/
import {parseArrayString} from './utils';

export const createBabelConfig = (store)=> `const configFunc = require('@skan-io/babel-config-react');

module.exports = {
  ...configFunc.default(
    ${store.answers.useJest ? 'true' : 'false'},
    [${parseArrayString(store.answers.browserTargets).array.map((target)=> `'${target}'`).toString()}],
    ['last 1 Chrome versions'],
    [${parseArrayString(store.answers.babelPlugins).string}]
  )
};
`;
