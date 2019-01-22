import {
  createNewRepo,
  initializeProject,
  addRemoteOrigin,
  fullPush,
  addCommitizen,
  initializeChangelog
} from './operations';
import {addResourceGitIgnore} from '../resources/gitignore';
import {storeAccessToken} from './utils';


export const initializeSourceControlManager = async (
  projectName, repoOwner, branch, gitAccessToken
)=> {
  storeAccessToken(gitAccessToken);

  await createNewRepo(projectName, gitAccessToken);

  await initializeProject();

  await addRemoteOrigin(repoOwner, projectName);

  addResourceGitIgnore();

  await fullPush(
    branch,
    branch === 'master',
    'chore',
    'tooling',
    'Initializing the branch',
    [],
    true
  );
};


export const initializeCommitStandard = async ()=> {
  await addCommitizen();
  await initializeChangelog();
};
