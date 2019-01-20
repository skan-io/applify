import fs from 'fs';
import {join, dirname} from 'path';
import {spawn} from 'child_process';
import {onExit} from '@rauschma/stringio';
import chalk from 'chalk';
import {shellExec} from './exec';


/* eslint no-console: 0 */

const generateCloses = (closes)=> {
  let closesString = '';

  for (const close of closes) {
    closesString += `#${close}, `;
  }

  return closesString.substring(0, closesString.length - 2);
};

const generateBreaking = (breaking)=> (breaking ? 'BREAKING CHANGE' : '');

const generateStandardCommitMessage =
  // eslint-disable-next-line
  (type, scope, message, closes, breaking)=> ({
    title: `${type}(${scope}): ${message}`,
    description: closes.length > 0
      ? `${generateCloses(closes)}\n${generateBreaking(breaking)}`
      : `${generateBreaking(breaking)}\n`
  })
    ;

export const sourceControlPush =
  // eslint-disable-next-line
  async (branch, type, scope, message, closes, breaking=false)=> {
    try {
      console.log(chalk.blue(`Checking out ${branch}`));
      const result = await shellExec(`git checkout -b ${branch}`);
      console.log(chalk.green(result.stdout));
      console.log(chalk.red(result.stderr));
    } catch (err) {
      console.log(chalk(err));
    }

    try {
      console.log(chalk.blue(`Adding all updated files to ${branch}`));
      const result = await shellExec(`git add -A`);
      console.log(chalk.green(result.stdout));
      console.log(chalk.red(result.stderr));
    } catch (err) {
      console.log(chalk(err));
    }

    try {
      const commitMessage = generateStandardCommitMessage(
        type, scope, message, closes, breaking
      );
      console.log('----------------************************ INITIALIZING BRANCH', {branch, commitMessage});
      console.log(
        chalk.blue(`Adding commit message: \n${commitMessage}`)
      );
      const result = await shellExec(
        // eslint-disable-next-line
        `git commit -m "${commitMessage.title}" -m "${commitMessage.description}"`
      );
      console.log(chalk.green(result.stdout));
      console.log(chalk.red(result.stderr));
    } catch (err) {
      console.log(chalk(err));
    }

    try {
      console.log(chalk.blue(`Pusing updated files to ${branch}`));
      const result = await shellExec(`git push -u origin ${branch}`);
      console.log(chalk.green(result.stdout));
      console.log(chalk.red(result.stderr));
    } catch (err) {
      console.log(chalk(err));
    }
  };


export const initializeSourceControlManager =
  // eslint-disable-next-line
  async (projectName, repoOwner, branch, withGitIgnore=false)=> {
    let result = null;

    console.log('----------------************************ INITIALIZING BRANCH', {branch});

    if (branch === 'master') {
      const gitApi = 'https://api.github.com/user/repos';
      const childProcess = spawn(
        'curl',
        ['-u', `'${repoOwner}'`, gitApi, '-d', `{"name":"${projectName}"}`],
        {stdio: [process.stdin, process.stdout]});

      childProcess.stderr.on('data', (data)=> {
        console.log(chalk.red(data));
        // eslint-disable-next-line
        // throw new Error('Unable to register the new repo with git (maybe check your credentials)');
      });

      await onExit(childProcess);

      try {
        result = await shellExec(`git init`);
        console.log(chalk.red(result.stderr));
        console.log(chalk.green(result.stdout));
      } catch (err) {
        console.log(chalk.red(err));
      }

      try {
        result = await shellExec(
          `git remote add origin git@github.com:${repoOwner}/${projectName}.git`
        );
        console.log(chalk.red(result.stderr));
        console.log(chalk.green(result.stdout));
      } catch (err) {
        console.log(chalk.yellow(err));
      }
    }

    if (withGitIgnore) {
      const outFileName = join(process.cwd(), '.gitignore');
      const sourceDir = join(dirname(process.argv[1]), 'templates');
      fs.copyFileSync(join(sourceDir, '.gitignore'), outFileName);

      console.log(chalk.green('Copied .gitignore'));
    }

    await sourceControlPush(
      branch, 'chore', 'tooling', 'Initializing the branch', [], true
    );
  };
