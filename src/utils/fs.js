import fs from 'fs';
import {basename, dirname, join} from 'path';
import {applifyError} from '../error';
import {TEMPLATE_COPY_ERROR} from '../error/codes';


export const createDirectory = (directory)=> {
  let printSuccess = `Found ${directory}`;

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
    printSuccess = `Created ${directory}`;
  }

  return {
    printInfo: `Find or create ${directory}`,
    printSuccess
  };
};

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

export const addResourceFromTemplate = (
    filename,
    srcFile=join(dirname(process.argv[1]), 'templates', filename),
    destFile=join(process.cwd(), filename),
    throwOnError=true
)=> {
  try {
    if (!fs.existsSync(dirname(destFile))) {
      fs.mkdirSync(dirname(destFile));
    }

    fs.copyFileSync(srcFile, destFile);
    fs.chmodSync(destFile, '755');

  } catch (err) {
    if (throwOnError) {
      throw applifyError(
        TEMPLATE_COPY_ERROR.code,
        // eslint-disable-next-line max-len
        `${TEMPLATE_COPY_ERROR.message}: failed to copy ${srcFile} to ${destFile} with ${err}`
      );
    }
  }
};
