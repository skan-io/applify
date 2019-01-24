import fs from 'fs';
import {join, dirname} from 'path';
import ora from 'ora';
import {printInfo, printSuccess, printError} from '../print';


// eslint-disable-next-line
export const addResourceFromTemplate = (
    filename,
    srcFile=join(dirname(process.argv[1]), 'templates', filename),
    destFile=join(process.cwd(), filename),
    throwOnError=true
)=> {
  const oraSpinner = ora();
  const info = `Copying ${srcFile} to ${destFile}...`;

  if (global.log) {
    printInfo(info);
  } else {
    oraSpinner.start(info);
  }


  try {
    if (!fs.existsSync(dirname(destFile))) {
      fs.mkdirSync(dirname(destFile));
    }

    fs.copyFileSync(srcFile, destFile);
    fs.chmodSync(destFile, '755');

    if (global.log) {
      printSuccess(`Copied ${srcFile} to ${destFile}`);
    } else {
      oraSpinner.succeed();
    }

  } catch (err) {
    if (!global.log) {
      oraSpinner.fail();
    }

    printError(err);

    if (throwOnError) {
      throw new Error(err);
    }
  }
};


// eslint-disable-next-line max-statements
export const addCustomResource = (
    filename,
    data,
    destFile=join(process.cwd(), filename),
    throwOnError=true
)=> {
  const oraSpinner = ora();

  try {
    const info = `Writing ${filename} to ${destFile}...`;

    if (global.log) {
      printInfo(info);
    } else {
      oraSpinner.start(info);
    }

    if (!fs.existsSync(dirname(destFile))) {
      fs.mkdirSync(dirname(destFile));
    }

    fs.writeFileSync(destFile, data);

    if (global.log) {
      printSuccess(`Wrote ${filename} to ${destFile}`);
    } else {
      oraSpinner.succeed();
    }


  } catch (err) {
    if (!global.log) {
      oraSpinner.fail();
    }

    printError(err);

    if (throwOnError) {
      throw new Error(err);
    }
  }
};
