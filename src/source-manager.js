import fs from 'fs';
import {join, dirname} from 'path';
import {prompt} from 'inquirer';
import fetch from 'node-fetch';
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
      : `${generateBreaking(breaking)}`
  })
    ;

export const sourceControlPush =
  // eslint-disable-next-line
  async (branch, newBranch, type, scope, message, closes, breaking=false)=> {
    try {
      console.log(chalk.blue(`Checking out ${branch}`));
      const result = await shellExec(
        `git checkout ${newBranch ? '-b' : ''} ${branch}`
      );
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
      console.log(
        // eslint-disable-next-line
        chalk.blue(`Adding commit message: \n${commitMessage.title}, ${commitMessage.description}`)
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
      console.log(chalk.blue(`Pushing updated files to ${branch}`));
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
    let gitAccessToken = null;
    let previousFile = null;

    const applifyDir = join(process.cwd(), '.applify');

    if (!fs.existsSync(applifyDir)) {
      fs.mkdirSync(applifyDir);
    }

    const gitTokenFile = join(applifyDir, 'githubToken');

    if (fs.existsSync(gitTokenFile)) {
      previousFile = fs.readFileSync(gitTokenFile, 'utf8');
    }

    // eslint-disable-next-line
    if (previousFile && previousFile.length > 6) {
      gitAccessToken = previousFile;
    } else {
      const answer = await prompt([{
        type: 'input',
        message: 'Enter your github personal access token:',
        name: 'gitAccessToken'
      }]);
      gitAccessToken = answer.gitAccessToken;
    }

    fs.writeFileSync(gitTokenFile, `${gitAccessToken}`);
    fs.chmodSync(gitTokenFile, '755');

    if (branch === 'master') {
      try {
        const response = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers: {
            Authorization: `bearer ${gitAccessToken}`
          },
          body: JSON.stringify({name: projectName})
        });

        await response.json();
        console.log(chalk.green('Successfully create new remote repository'));
      } catch (err) {
        console.log(chalk.red(err));
      }

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
      branch,
      branch === 'master',
      'chore',
      'tooling',
      'Initializing the branch',
      [],
      true
    );
  };
