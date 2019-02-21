import fs from 'fs';
import {basename, dirname} from 'path';

export const removeDirectory = (path, except=[])=> {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file)=> {
      // eslint-disable-next-line
      let curPath = path + "/" + file;

      if (
        fs.lstatSync(curPath).isDirectory()
        && !except.some(
          (name)=> basename(curPath) !== name && dirname(curPath) !== name
        )
      ) { // recurse
        removeDirectory(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }

    });
    fs.rmdirSync(path);
  }
};
