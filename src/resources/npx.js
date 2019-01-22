import {join} from 'path';
import {addResourceFromTemplate} from '.';


const scripts = [
  'index.js', 'config.js',
  'lib/find-files.js', 'lib/utils.js', 'lib/walk.js'
];


export const addNpxScripts = ()=> {
  for (const script of scripts) {
    addResourceFromTemplate(join('scripts', script));
  }
};
