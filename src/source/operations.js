import {execute} from '../exec';
import {fetch} from '../fetch';
import {printError, printWarning} from '../print';
import {generateStandardCommitMessage} from './utils';

const REPO_ALREADY_EXISTS = 422;

export const checkout = async (branch, isNew=false)=> {

  await execute(
    `git checkout ${isNew ? '-b' : ''} ${branch}`,
    `Checking out ${branch}`
  );
};

export const addAll = async (branch)=> {
  await execute(
    `git add -A`,
    `Adding all updated files to ${branch}`
  );
};

// eslint-disable-next-line max-params
export const commit = async (type, scope, message, closes, breaking)=> {
  const commitMessage = generateStandardCommitMessage(
    type, scope, message, closes, breaking
  );

  await execute(
    `git commit -m "${commitMessage.title}" -m "${commitMessage.description}"`,
    `Adding commit message:
    ${commitMessage.title}, ${commitMessage.description}`
  );
};

export const push = async (branch, link=false)=> {
  await execute(
    `git push ${link ? '-u' : ''} origin ${branch}`,
    `Pushing updated files to ${branch}`
  );
};

export const fullPush =
  // eslint-disable-next-line
  async (branch, newBranch, type, scope, message, closes, breaking=false)=> {
    await checkout(branch, newBranch);

    await addAll(branch);

    await commit(type, scope, message, closes, breaking);

    await push(branch, newBranch);
  };

export const createNewRepo = async (projectName, token)=> {
  try {
    await fetch(
      'https://api.github.com/user/repos',
      'POST',
      JSON.stringify({name: projectName}),
      token,
      null,
      true
    );
  } catch ({message, code}) {
    if (code === REPO_ALREADY_EXISTS) {
      printWarning('Repository already exists');
      throw new Error('Repository already exists');
    } else {
      printError('Unable to create new repository');
      throw new Error(`${code} ${message}`);
    }
  }
};

export const initializeProject = async ()=> {
  await execute('git init .', 'Initializing the git project');
};

export const addRemoteOrigin = async (repoOwner, projectName)=> {
  await execute(
    `git remote add origin git@github.com:${repoOwner}/${projectName}.git`,
    `Adding remote origin git@github.com:${repoOwner}/${projectName}.git`
  );

  printWarning(
    `Note: the access token provided must come from the account ${repoOwner}`
  );
};

export const addCommitizen = async ()=> {
  printWarning('...please wait. This may take a few minutes...');

  await execute(
    `npm i -D commitizen`,
    'Installing commitizen as a dev dependency'
  );
};

export const initializeChangelog = async ()=> {
  printWarning('...please wait. This may take a few minutes...');

  await execute(
    // eslint-disable-next-line
    `npx commitizen --force init cz-conventional-changelog --save-dev --save-exact`,
    'Setting cz-conventional-changelog as changelog'
  );
};
