import {join} from 'path';
import {readFileSync, writeFileSync} from 'fs';
import {fetch, fetchWithHeaders} from '../../fetch';
import {HTTP_NOT_FOUND} from '../../fetch/http-codes';
import {execute} from '../../execute';
import {applifyError} from '../../error';
import {
  REPO_ALREADY_EXISTS,
  REPO_AUTH_ERROR,
  REPO_CREATE_ERROR,
  GIT_INIT_ERROR
} from '../../error/codes';
import {rewriteGitIgnoreTask} from './create-gitignore';
import {stringify} from '../../utils/strings';
import {parseArrayString} from '../utils';
import {parseAndReorderBranches} from './helpers';

/* eslint camelcase: 0 */


const REPO_EXISTS_CODE = 422;
const AUTH_ACCESS_CODE_A = 401;
const AUTH_ACCESS_CODE_B = 403;


const throwFromCode = (code, message)=> {
  if (code === REPO_EXISTS_CODE) {
    throw applifyError(
      REPO_ALREADY_EXISTS.code,
      `${REPO_ALREADY_EXISTS.message}: Repository already exists`
    );
  }
  if (code === AUTH_ACCESS_CODE_A || code === AUTH_ACCESS_CODE_B) {
    throw applifyError(
      REPO_AUTH_ERROR.code,
      `${REPO_AUTH_ERROR.message}: Invalid access token`
    );
  }

  throw applifyError(
    REPO_CREATE_ERROR.code,
    `${REPO_CREATE_ERROR.message}: Cannot create repository ${code} ${message}`
  );
};

const fetchInitGitRemote = async (store)=> await fetch(
  store.answers.repoOrg && store.answers.repoOrg !== 'none'
    ? `https://api.github.com/orgs/${store.answers.repoOrg}/repos`
    : 'https://api.github.com/user/repos',
  'POST',
  JSON.stringify({
    name: store.answers.projectName,
    description: store.answers.projectDescription,
    private: store.answers.projectPrivate,
    license_template: store.answers.projectLicense,
    auto_init: true,
    gitignore_template: 'Node'
  }),
  store.answers.gitAccessToken,
  null,
  undefined,
  true
);

const setGitUrlsInStore = (store, response)=> {
  store.gitUrl = response.git_url;
  store.gitSSHUrl = response.ssh_url;
  store.gitHtmlUrl = response.html_url;
};

const initialiseGitRemote = ()=> ({
  type: 'task',
  description: 'intialise git remote',
  task: async (storeCtx)=> {
    try {
      const {
        response, printInfo, printSuccess
      } = await fetchInitGitRemote(storeCtx);

      setGitUrlsInStore(storeCtx, response);

      return {printInfo, printSuccess};
    } catch ({code, message}) {
      throwFromCode(code, message);
    }
  }
});

const initialiseGitLocal = ()=> ({
  type: 'task',
  description: 'intialise git locally',
  task: async (store)=> {
    const output = await execute({cmd: 'git init .', info: 'Git init'});
    const {result} = output;

    if (result.stderr) {
      throw applifyError(
        GIT_INIT_ERROR.code,
        // eslint-disable-next-line
        `${GIT_INIT_ERROR.message}: failed with ${result.stderr}`
      );
    }

    store.gitInitialised = true;
    store.gitUpToDate = false;

    return output;
  }
});

const addGitRemote = ()=> ({
  type: 'task',
  description: 'add git remote',
  task: async (store)=> {
    const output = await execute(
      {
        cmd: `git remote add origin ${store.gitSSHUrl}`,
        info: 'Add git ssh remote'
      },
      false
    );

    store.gitRemoteAdded = true;

    return output;
  }
});

const pullCurrentMaster = ()=> ({
  type: 'task',
  description: 'pull current master',
  task: async (store)=> {
    await execute(
      {
        cmd: `git fetch --all`,
        info: 'Git fetch from remote'
      },
      false
    );

    const output = await execute(
      {
        cmd: `git reset --hard origin/master`,
        info: 'Git reset master to remote'
      },
      false
    );

    store.gitUpToDate = true;

    return output;
  }
});

const getCheckoutAndAddTask = (branch)=> ({
  type: 'batch',
  description: `Checking out and commiting ${branch}`,
  children: [{
    type: 'task',
    description: `checking out ${branch}`,
    task: async ()=> {
      const output = await execute(
        {
          cmd: `git checkout -b ${branch}`,
          info: `Git checkout ${branch}`
        },
        false
      );

      return output;
    }
  }, {
    type: 'task',
    description: `adding ${branch} files`,
    task: async ()=> {
      const output = await execute(
        {
          cmd: 'git add -A',
          info: `Git add ${branch}`
        },
        false
      );

      return output;
    }
  }]
});

const runCommit = async (store, task, branch)=> {
  task.children.push({
    type: 'task',
    description: `commiting ${branch}`,
    task: async ()=> {
      const command = store.answers.useCommitizen
        ? 'git commit -m "feat(project): Project setup and initial files"'
        : 'git commit -m "Project setup and initial files"';

      const output = await execute(
        {cmd: command, info: `Git commit ${branch}`},
        false
      );

      return output;
    }
  });

  store.addTask(task);

  store.addTask({
    type: 'batch',
    description: `Push changes to ${branch}`,
    children: [
      {
        type: 'task',
        description: `push changes to ${branch} to remote origin`,
        task: async ()=> {
          const output = await execute(
            {
              cmd: `git push origin ${branch}`,
              info: `Git push ${branch}`
            }
          );

          return output;
        }
      }
    ]
  });
};


export const initialiseGit = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Initialise git repository',
    children: [
      initialiseGitRemote(),
      initialiseGitLocal(),
      addGitRemote(),
      pullCurrentMaster()
    ]
  });
};

export const rewriteGitIgnore = async (store)=> {
  await rewriteGitIgnoreTask(store);
};

export const setupCommitizen = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Install and setup commitizen',
    children: [
      {
        type: 'task',
        description: 'install commitizen globally',
        task: async (storeCtx)=> {
          const output = storeCtx.packageInstaller.install(
            'commitizen', 'global'
          );

          return output;
        }
      },
      {
        type: 'task',
        description: 'install skan-io commit config',
        task: async (storeCtx)=> {
          const output = storeCtx.packageInstaller.install(
            '@skan-io/release-config'
          );

          return output;
        }
      }
    ]
  });
};

export const rewriteReleaseConfig = async (store)=> {
  if (store.answers.projectPrivate) {
    store.addTask({
      type: 'batch',
      description: 'Rewrite .releaserc',
      children: [
        {
          type: 'task',
          description: 'rewrite .releaserc (no npm release)',
          task: (storeCtx)=> {
            const releaseFile = join(storeCtx.workingDir, '.releaserc');
            const releaseJson = JSON.parse(readFileSync(releaseFile, 'utf8'));

            releaseJson.plugins = [
              '@semantic-release/commit-analyzer',
              '@semantic-release/release-notes-generator',
              [
                '@semantic-release/npm',
                {
                  npmPublish: false
                }
              ],
              '@semantic-release/github'
            ];

            const releaseString = stringify(releaseJson);

            writeFileSync(releaseFile, releaseString);

            return {
              printInfo: `Rewrote ${releaseFile}`,
              printSuccess: releaseString
            };
          }
        }
      ]
    });
  }
};

export const checkoutAndPush = async (store)=> {
  const initialBranches = store.answers.initialBranches;

  const branches = parseAndReorderBranches(
    Array.isArray(initialBranches)
      ? initialBranches
      : initialBranches.split(',')
  );

  for (const branch of branches) {
    const task = getCheckoutAndAddTask(branch);
    runCommit(store, task, branch);
  }
};

export const lockDownMasterBranch = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Lock down master branch',
    children: [
      {
        type: 'task',
        description: 'update master branch protection',
        // eslint-disable-next-line complexity
        task: async (storeCtx)=> {
          const {
            repoOrg,
            repoOwner,
            projectName,
            projectPrivate,
            useCi,
            // TODO ciPlatform
            repoMaintainers,
            gitAccessToken
          } = storeCtx.answers;

          const owner = repoOrg && repoOrg !== '' && repoOrg !== 'none'
            ? repoOrg
            : repoOwner;

          const contexts = projectPrivate
            ? [
              `Travis CI - Branch`,
              `Travis CI - Pull Request`
            ]
            : [
              'continuous-integration/travis-ci/pr',
              'continuous-integration/travis-ci/push'
            ];

          // private projects will use travis.com which is now
          // a github app and doesnt require contexts
          const statusChecks = useCi
            ? {strict: true, contexts}
            : null;

          const prReviews = parseArrayString(repoMaintainers).array.length > 1
            ? {
              dismiss_stale_reviews: true,
              require_code_owner_reviews: false,
              required_approving_review_count: 1
            }
            : null;

          return await fetchWithHeaders(
            `https://api.github.com/repos/${owner}/${projectName}/branches/master/protection`,
            'PUT',
            JSON.stringify({
              required_status_checks: statusChecks,
              enforce_admins: true,
              required_pull_request_reviews: prReviews,
              restrictions: null
            }),
            {
              Accept: 'application/vnd.github.luke-cage-preview+json',
              ['Content-Type']: 'application/json',
              Authorization: `Bearer ${gitAccessToken}`
            },
            true
          );
        }
      }
    ]
  });
};