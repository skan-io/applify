import fs from 'fs';
import {resolve} from 'path';

export const readDirectory = (directory, regularExpression)=> {
  let files = [];
  fs.readdirSync(directory).forEach((file)=> {
    const fullPath = resolve(directory, file);

    if (fs.statSync(fullPath).isDirectory()) {
      const subdirFiles = readDirectory(fullPath, regularExpression);
      if (subdirFiles.length > 0) {
        files = [...files, ...subdirFiles];
      }
    }

    if (!regularExpression.test(fullPath)) {
      return;
    }
    files.push(fullPath);
  });
  return files;
};

export const findFiles = (base = '.', regularExpression = /\.js$/)=>
  readDirectory(base, regularExpression);
