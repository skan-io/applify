import {join} from 'path';
import {readFileSync, writeFileSync} from 'fs';
import {fetch} from '../../fetch';
import {HTTP_NOT_FOUND} from '../../fetch/http-codes';
import {execute, spawn} from '../../execute';
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
  if (store.answers.useCommitizen) {
    // TODO: can do better than git-cz
    store.addTask(task);
    await store.runTasks();

    await spawn({
      cmd: 'npx',
      args: ['git-cz'],
      info: `Commit ${branch} with commitizen standard`
    }, false);
  } else {
    task.children.push({
      type: 'task',
      description: `commiting ${branch}`,
      task: async ()=> {
        const output = await execute(
          {
            cmd: 'git commit -m "Project setup and initial files"',
            info: `Git commit ${branch}`
          },
          false
        );

        return output;
      }
    });

    store.addTask(task);
  }

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

const getLockdownUrl = (org, owner, name)=> {
  const base = `https://api.github.com/repos`;
  const repoName = (
    org === undefined || org === '' || org === 'none'
  )
    ? owner
    : org;

  return `${base}/${repoName}/${name}/branches/master/protection`;
};

// eslint-disable-next-line max-params
const fetchGitLockdown = async (
  url, statusChecks, dismissalRestrictions, codeReviews, restrictions, token
)=> {
  let status = HTTP_NOT_FOUND;

  while (status === HTTP_NOT_FOUND) {
    status = await fetch(
      url,
      'PUT',
      JSON.stringify({
        required_status_checks: statusChecks,
        enforce_admins: true,
        required_pull_request_reviews: {
          dismissal_restrictions: dismissalRestrictions,
          dismiss_stale_reviews: true,
          require_code_owner_reviews: codeReviews,
          required_approving_review_count: codeReviews ? 1 : 0
        },
        restrictions
      }),
      token,
      'application/json',
      'application/vnd.github.luke-cage-preview+json',
      false
    );
  }

  return status;
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
            useCi,
            ciPlatform,
            repoMaintainers
          } = storeCtx.answers;

          const url = getLockdownUrl(repoOrg, repoOwner, projectName);
          const contexts = [
            `continuous-integration/${ciPlatform}/pr`,
            `continuous-integration/${ciPlatform}/push`
          ];
          const statusChecks = useCi
            ? {strict: true, contexts}
            : undefined;
          const dismissalRestrictions = (
            repoOrg && repoOrg !== '' && repoOrg !== 'none'
          ) ? {users: [repoOwner]}
            : undefined;
          const codeReviews = Boolean(
            parseArrayString(repoMaintainers).array.length
          );
          const restrictions = repoOrg && repoOrg !== '' && repoOrg !== 'none'
            ? {users: parseArrayString(repoMaintainers).array}
            : null;

          return await fetchGitLockdown(
            url, statusChecks, dismissalRestrictions, codeReviews, restrictions
          );
        }
      }
    ]
  });
};
