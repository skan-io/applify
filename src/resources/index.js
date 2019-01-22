import fs from 'fs';
import {join, dirname} from 'path';
import {printInfo, printSuccess, printError} from '../print';


export const addResourceFromTemplate = (
    filename,
    srcFile=join(dirname(process.argv[1]), 'templates', filename),
    destFile=join(process.cwd(), filename),
    throwOnError=true
)=> {
  printInfo(`Copying ${srcFile} to ${destFile}...`);

  try {
    if (!fs.existsSync(dirname(destFile))) {
      fs.mkdirSync(dirname(destFile));
    }

    fs.copyFileSync(srcFile, destFile);
    fs.chmodSync(destFile, '755');

    printSuccess(`Copied ${srcFile} to ${destFile}`);
  } catch (err) {
    printError(err);

    if (throwOnError) {
      throw new Error(err);
    }
  }
};


export const addCustomResource = (
    filename,
    data,
    destFile=join(process.cwd(), filename),
    throwOnError=true
)=> {
  try {
    printInfo(`Writing ${filename} to ${destFile}...`);

    if (!fs.existsSync(dirname(destFile))) {
      fs.mkdirSync(dirname(destFile));
    }

    fs.writeFileSync(destFile, data);

    printSuccess(`Wrote ${filename} to ${destFile}`);

  } catch (err) {
    printError(err);

    if (throwOnError) {
      throw new Error(err);
    }
  }
};
