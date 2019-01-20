import fs from 'fs';
import {join, dirname} from 'path';
import chalk from 'chalk';
import {shellExec} from './exec';


/* eslint no-console: 0 */

// eslint-disable-next-line
export const initializeSourceControl = async (projectName, repoOwner)=> {
  let result = null;

  try {
    result = await shellExec(`git init`);
    console.log(chalk.red(result.stderr));
    console.log(chalk.green(result.stdout));
  } catch (err) {
    console.log(chalk.red(err));
  }

  try {
    result = await shellExec(
      `git remote add origin https://github.com/${repoOwner}/${projectName}.git`
    );
    console.log(chalk.red(result.stderr));
    console.log(chalk.green(result.stdout));
  } catch (err) {
    console.log(chalk.red(err));
  }

  const outFileName = join(process.cwd(), '.gitignore');
  const sourceDir = join(dirname(process.argv[1]), 'templates');
  fs.copyFileSync(join(sourceDir, '.gitignore'), outFileName);

  console.log(chalk.green('Copied .gitignore'));
};
