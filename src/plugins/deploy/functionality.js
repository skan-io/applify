import {join} from 'path';
import {writeFileSync} from 'fs';
import opn from 'opn';
import {fetchWithHeaders} from '../../fetch';
import {createTravisConfig} from './create-travis-config.js';


const getTravisAccessToken = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Get Travis CI auth token',
    children: [
      {
        type: 'task',
        description: 'exchange git token for travis token',
        task: async (storeCtx)=> {
          const {projectPrivate} = storeCtx.answers;
          const endpoint = projectPrivate ? 'travis-ci.com' : 'travis-ci.org';

          const {
            response, printInfo: info, printSuccess
          } = await fetchWithHeaders(
            `https://api.${endpoint}/auth/github`,
            'POST',
            JSON.stringify({
              // eslint-disable-next-line
              github_token: storeCtx.answers.gitAccessToken
            }),
            {
              ['User-Agent']: 'MyClient/1.0.0',
              Accept: 'application/vnd.travis-ci.2.1+json',
              Host: `api.${endpoint}`,
              ['Content-Type']: 'application/json',
              ['Content-Length']: 37
            },
            true
          );

          storeCtx.answers.travisAccessToken = response.access_token;

          return {
            printInfo: info,
            printSuccess
          };
        }
      }
    ]
  });
};

const checkForSynced = async (store)=> {
  let isSyncing = true;
  const {projectPrivate} = store.answers;
  const endpoint = projectPrivate ? 'travis-ci.com' : 'travis-ci.org';

  while (isSyncing) {
    const {response} = await fetchWithHeaders(
      `https://api.${endpoint}/users/sync`,
      'POST',
      undefined,
      {
        ['User-Agent']: 'MyClient/1.0.0',
        Accept: 'application/vnd.travis-ci.2.1+json',
        Host: `api.${endpoint}`,
        Authorization: `token ${store.answers.travisAccessToken}`
      },
      false // dont throw
    );

    isSyncing = response ? response.is_syncing : true;
  }
};

const syncUserWithTravis = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Sync Travis CI with Github',
    children: [
      {
        type: 'task',
        // eslint-disable-next-line max-len
        description: `sync git user with ${store.answers.projectPrivate ? 'travis-ci.com' : 'travis-ci.org'}`,
        task: async (storeCtx)=> {
          const {projectPrivate} = storeCtx.answers;
          const endpoint = projectPrivate ? 'travis-ci.com' : 'travis-ci.org';

          const {printInfo: info, printSuccess} = await fetchWithHeaders(
            `https://api.${endpoint}/users/sync`,
            'POST',
            undefined,
            {
              ['User-Agent']: 'MyClient/1.0.0',
              Accept: 'application/vnd.travis-ci.2.1+json',
              Host: `api.${endpoint}`,
              Authorization: `token ${storeCtx.answers.travisAccessToken}`
            },
            false // dont throw
          );

          await checkForSynced(storeCtx);

          return {
            printInfo: info,
            printSuccess
          };
        }
      }
    ]
  });
};

const switchOnRepositoryInTravis = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Switch on repository in Travis CI',
    children: [
      {
        type: 'task',
        description: 'get travis repo id',
        task: async (storeCtx)=> {
          const {projectName, repoOwner, repoOrg} = storeCtx.answers;
          const owner = repoOrg && repoOrg !== '' && repoOrg !== 'none'
            ? repoOrg
            : repoOwner;
          const {projectPrivate} = storeCtx.answers;
          const endpoint = projectPrivate ? 'travis-ci.com' : 'travis-ci.org';

          const {
            response, printInfo: info, printSuccess
          } = await fetchWithHeaders(
            `https://api.${endpoint}/repos/${owner}/${projectName}`,
            'GET',
            undefined,
            {
              ['User-Agent']: 'MyClient/1.0.0',
              Accept: 'application/vnd.travis-ci.2.1+json',
              Host: `api.${endpoint}`,
              Authorization: `token ${storeCtx.answers.travisAccessToken}`
            },
            true
          );

          storeCtx.travisRepoId = response.repo.id;

          return {
            printInfo: info,
            printSuccess
          };
        }
      },
      {
        type: 'task',
        description: 'switch ci on for repo',
        task: async (storeCtx)=> {
          const {projectPrivate} = storeCtx.answers;
          const endpoint = projectPrivate ? 'travis-ci.com' : 'travis-ci.org';

          const {printInfo: info, printSuccess} = await fetchWithHeaders(
            `https://api.${endpoint}/hooks`,
            'PUT',
            JSON.stringify({
              hook: {id: storeCtx.travisRepoId, active: true}
            }),
            {
              ['User-Agent']: 'MyClient/1.0.0',
              Accept: 'application/vnd.travis-ci.2.1+json',
              Host: `api.${endpoint}`,
              Authorization: `token ${storeCtx.answers.travisAccessToken}`,
              ['Content-Type']: 'application/json'
            },
            true
          );

          return {
            printInfo: info,
            printSuccess
          };
        }
      }
    ]
  });
};

const addEnvironmentVariables = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Add GH_TOKEN to travis env',
    children: [{
      type: 'task',
      description: 'add environment variables to travis',
      task: async (storeCtx)=> {
        const {
          projectPrivate, travisAccessToken, gitAccessToken
        } = storeCtx.answers;
        const endpoint = projectPrivate ? 'travis-ci.com' : 'travis-ci.org';

        return await fetchWithHeaders(
          `https://api.${endpoint}/settings/env_vars?repository_id=${storeCtx.travisRepoId}`,
          'POST',
          JSON.stringify({
            // eslint-disable-next-line
            env_var: {
              name: 'GH_TOKEN',
              value: gitAccessToken,
              public: false
            }
          }),
          {
            ['User-Agent']: 'MyClient/1.0.0',
            Accept: 'application/vnd.travis-ci.2.1+json',
            Host: `api.${endpoint}`,
            Authorization: `token ${travisAccessToken}`,
            ['Content-Type']: 'application/json'
          },
          true
        );
      }
    }]
  });
};

export const activateTravisApp = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Activate Travis CI Github App',
    children: [
      {
        type: 'task',
        description: 'open travis for activation',
        task: async (storeCtx)=> {
          const endpoint = storeCtx.answers.projectPrivate
            ? 'travis-ci.com' : 'travis-ci.org';

          await opn(`https://${endpoint}/account/repositories`, {wait: false});

          return {
            printInfo: `Opened https://${endpoint}/account/repositories for activation`
          };
        }
      }
    ]
  });
};

export const createCIConfig = async (store)=> {
  if (store.answers.ciPlatform === 'travis-ci') {
    store.addTask({
      type: 'batch',
      description: 'Write travis config',
      children: [
        {
          type: 'task',
          description: 'Write travis.yml file',
          task: (storeCtx)=> {
            const travisPath = join(storeCtx.workingDir, '.travis.yml');
            const travisConfig = createTravisConfig(store);

            writeFileSync(travisPath, travisConfig);

            return {
              printInfo: `Wrote ${travisPath}`
            };
          }
        }
      ]
    });
  }

  // TODO other CI tools
};

export const hookupCI = async (store)=> {
  if (store.answers.ciPlatform === 'travis-ci') {
    await getTravisAccessToken(store);
    await syncUserWithTravis(store);
    await switchOnRepositoryInTravis(store);
    await addEnvironmentVariables(store);
  }

  // TODO other CI tools
};
