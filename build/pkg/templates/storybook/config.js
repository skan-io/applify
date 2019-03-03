/* eslint-env node */
/* global STORYBOOK_IMPORT_ENV */
import {configure, addDecorator} from '@storybook/react';
import {withKnobs} from '@storybook/addon-knobs';
import {withInfo} from '@storybook/addon-info';
import {resolve} from 'path';
import {withCustomContainer} from '../src/stories/helpers';
import {findFiles} from '../scripts/lib/find-files';

let filenames = [];
let doImport = null;
if (STORYBOOK_IMPORT_ENV === 'webpack') {
  const req = require.context('../src', true, /.story.js$/);
  filenames = req.keys();
  doImport = req;
} else if (STORYBOOK_IMPORT_ENV === 'jest') {
  filenames = findFiles(resolve(__dirname, '..', 'src'), /.story.js$/);
  doImport = (file)=> require(file);
} else {
  throw new Error('unknown environment running storybook');
}

function loadStories() {
  filenames.forEach((filename)=> doImport(filename));
}

if (STORYBOOK_IMPORT_ENV === 'webpack') {
  addDecorator(withInfo);
  addDecorator(withKnobs);
  addDecorator(withCustomContainer('#eee'));
}

configure(loadStories, module);

