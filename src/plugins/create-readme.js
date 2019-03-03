import fs from 'fs';
import isUrl from 'isurl';

/* eslint max-len: 0 */

// eslint-disable-next-line max-params
const createReadmeHeader = (store)=> {
  const {
    faviconUrl, useRedux, useEslint, useAmplify, useStorybook,
    projectName, projectDescription
  } = store.answers;

  let src = `./src/${faviconUrl}`;

  if (isUrl(faviconUrl) || faviconUrl.startsWith('http')) {
    src = faviconUrl;
  }

  return `
  <p align="center"><img src='${src}' height='140' /></p>
  <p align="center">
    <b> ${projectName} </b>
  </p>

  <p align="center">
  <b>
  :zap: ${projectDescription}
  </b>
  </p>

  -------------

  <p align="center">
    <a><img src="https://img.shields.io/badge/release-alpha-yellow.svg?style=flat-square" alt="Build Status"></a>
    <a href="https://github.com/RichardLitt/standard-readme"><img src="https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square" alt="contributions welcome"></a>
    <a><img src="https://img.shields.io/badge/frontend-react-purple.svg?style=flat-square"></a>
    ${useRedux ? '<a><img src="https://img.shields.io/badge/state-redux-blue.svg?style=flat-square"></a>' : ''}${useEslint ? '\n    <a><img src="https://img.shields.io/badge/lint-eslint-pink.svg?style=flat-square"></a>' : ''}${useAmplify ? '\n    <a><img src="https://img.shields.io/badge/backend-aws-orange.svg?style=flat-square" alt="code style: prettier"></a>' : ''}${useAmplify ? '\n    <a><img src="https://img.shields.io/badge/api-graphql-purple.svg?style=flat-square"></a>' : ''}${useStorybook ? '\n    <a><img src="https://img.shields.io/badge/ui-storybook-lightgrey.svg?style=flat-square"></a>' : ''}
  </p>

  <p> &nbsp; </p>

  :book: Read the [Quick Start Guide](https://enter-your-docs-guide-url.com)

  :rocket: [Try it out](https://enter-your-site-url.com)

  :hatched_chick: Current status: **Alpha**

  :tractor: **[Roadmap](https://enter-your-roadmap-url.com)**

  <p> &nbsp; </p>\n
  `;
};

const createReadmeTableOfContents = (store)=> {
  const {
    privatePackage, useMultiEnv, useEslint, useJest, useCommitizen
  } = store.answers;

  return `
  ## Table of Contents

  ${privatePackage ? '- [Security](#security)' : '\r'}
  - [Background](#background)
  - [Install](#install)
  - [Usage](#usage)
  - [Build & Package](#build-and-package)${useMultiEnv ? '\n- [Multi Environment Support](#multi-environment)' : ''}
  - [Dev Tools](#dev-tools)${useEslint ? '\n  - [ESLint](#eslint-installation)' : ''}${useJest ? '\n  - [Testing](#running-tests)' : ''}${useCommitizen ? '\n  - [Contributing](#contributing)' : ''}
  - [Documentation](#documentation)
  - [App Configuration](#configuration)
  - [Maintainers](#maintainers)
  - [Under The Hood](#under-the-hood)
  - [Disclaimer](#disclaimer)
  - [License](#license)\n
  `;
};

const createSecuritySection = ()=> `
## Security

Unauthorised access to this repository, any of its contents is prohibited.
Permission must be explicitly given from a maintainer.

Do not copy or share this repository, its url, or any of its downloadable
content unless specified by the license.

Please refer to the [LICENSE](./LICENSE)\n
`;

const createInstallSection = ()=> `
## Install

Clone the repo and install dependencies:

> *Caveat* - requires node version >= 10, use:
>
> \`\`\`bash
> nvm use 10
> \`\`\`

> Make sure to use the latest version of npm and applify:
> \`\`\`bash
> npm i -g npm
> npm i -g @skan-io/applify
> \`\`\`
>

>**Note:**
> If you upgrade from previous versions of node or npm you may have to
> clear out your \`node_modules\` and the npm caches:
> \`\`\`bash
> rm -rf node_modules
> npm cache clean --force
> \`\`\`\n
`;

const createGitSection = (store)=> `
\`\`\`bash
  git clone ${store.gitSSHUrl}
  cd ${store.answers.projectName}
  npm ci
  npx run
\`\`\`
`;

const createUsageSection = (store)=> `
## Usage

To start the application in your development environment:

\`\`\`bash
npx run
\`\`\`

>This will run ${store.answers.useStorybook ? 'both ' : ''}\`webpack\`${store.answers.useStorybook ? ' and `storybook` servers' : ''}.
>Application can be viewed on \`localhost:${store.answers.devServerPort}\`
${store.answers.useStorybook ? `>Storybook stories can be viewed at \`localhost:${store.answers.storybookServerPort}\`` : ''}

This runs [webpack's dev server](https://webpack.js.org/configuration/dev-server/)
with live reloading enabled. You can find it's configuration in [webpack.config.babel.js](./webpack.config.babel.js).

Note: If you need to start a dev server supporting all production browsers (${store.answers.browserTargets.toString()})
please run \`npx run config --node-env=production\`.\n
`;

const createBuildSection = ()=> `
## Build and Package

To run a build use:

\`\`\`bash
  npx run build
\`\`\`

This will run a production build.

To run a clean build use:

\`\`\`bash
  npx run clean build
\`\`\`\n
`;

const createMultiEnvSection = ()=> `
## Multi environment

to create environments:
\`\`\`bash
applify create <branch-name>
\`\`\`
to switch environments:
\`\`\`bash
applify switch <branch-name>
\`\`\`
to push environments:
\`\`\`bash
applify push
\`\`\`
to pull environments:
\`\`\`bash
applify pull
\`\`\`\n
`;

const createDevToolsSection = (store)=> `
## Dev Tools

* [react-devtools](https://github.com/facebook/react-devtools)
${store.answers.useRedux ? '* [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension)\n' : '\n'}
`;

const createEslintSection = ()=> `
## ESLint Installation

The eslint config can be found in [.eslintrc](./.eslintrc).
If for some odd reason, \`eslint\` does not work, you can add the \`node_modules/.bin\` to your path:

\`\`\`bash
export PATH="$PATH:./node_modules/.bin"
\`\`\`\n
`;

const createTestSection = (store)=> `
## Running tests

Before committing and pushing code you should run the full suite of tests.
${store.answers.useEslint ? 'The full test command includes linting from `eslint`.' : ''}
The unit-tests are using [jest](https://facebook.github.io/jest/)
with config from [jest.config.js](./jest.config.js):

\`\`\`bash
npx run test
\`\`\`

${store.answers.useCodeCoverage
    ? 'You will find code coverage results in `build/cov` including a HTML report:\n```bash\n open ./build/cov/lcov-report/index.html \n```\n'
    : ''
}

#### Quickly Run Tests

NOTE: The next two are only for debugging. You must run the full test suite (as
described above) before committing/pushing to origin.

##### All tests (without coverage or linting and using the test cache)

\`\`\`bash
npx run jest
\`\`\`

##### Single test

\`\`\`bash
npx run jest FILE_PATH_TO_MATCH
\`\`\`

where FILE_PATH_TO_MATCH is the path to match (e.g. - app/reducer)

>NOTE: that if you are running on Windows, you have to specify double slashes for
>the path:
>
>\`\`\`bash
>npx run jest src\\\\app\\\\reducer.test.js
>\`\`\`\n
`;

const createDocumentationSection = (store)=> `
## Documentation

To run the local documentation generator and view the project documentation run:

\`\`\`bash
npx run docs
\`\`\`

Once started, you can view the docs at http://localhost:${store.answers.docsSeverPort}

See \`@skan-io/code-documentation\` repo for details on how to document your code
to work with the generator.\n
`;

const createContributingSection = ()=> `
## Contributing
Pull requests and commits follow commitizen conventional commit guidelines.\n
`;

const createConfigurationSection = ()=> `
## Configuration\n
`;

const createMaintainersSection = (store)=> `
## Maintainers

${store.answers.repoMaintainers
    .split(',')
    .map((maintainer)=> `[@${maintainer}](https://github.com/${maintainer}) \n`)
    .toString()
}
`;

const createReadmeFooter = (store)=> `
Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## Under the Hood

## Disclaimer

Any use of this software by any person will incur no liability on the owner of this software.

## License
[MIT](https://choosealicense.com/licenses/${store.answers.projectLicense.toLowerCase()}/)
`;

// eslint-disable-next-line max-statements, complexity
export const createReadme = async (store)=> {
  const task = {
    type: 'batch',
    description: 'Generate README.md from store details',
    children: [
      {
        type: 'task',
        description: 'create readme header',
        task: (storeCtx)=> {
          storeCtx.readme = '';
          storeCtx.readme += createReadmeHeader(storeCtx);

          return {
            printInfo: 'Created readme header'
          };
        }
      },
      {
        type: 'task',
        description: 'create readme table of contents',
        task: (storeCtx)=> {
          storeCtx.readme += createReadmeTableOfContents(storeCtx);

          return {
            printInfo: 'Created readme table of contents'
          };
        }
      }
    ]
  };

  if (store.answers.privatePackage) {
    task.children.push({
      type: 'task',
      description: 'create readme security section',
      task: (storeCtx)=> {
        storeCtx.readme += createSecuritySection();

        return {
          printInfo: 'Created readme security section'
        };
      }
    });
  }

  task.children.push({
    type: 'task',
    description: 'create readme install section',
    task: (storeCtx)=> {
      storeCtx.readme += createInstallSection();

      return {
        printInfo: 'Created readme install section'
      };
    }
  });

  if (store.answers.useGit) {
    task.children.push({
      type: 'task',
      description: 'create readme git section',
      task: (storeCtx)=> {
        storeCtx.readme += createGitSection(storeCtx);

        return {
          printInfo: 'Created readme git section'
        };
      }
    });
  }

  task.children.push({
    type: 'task',
    description: 'create readme usage section',
    task: (storeCtx)=> {
      storeCtx.readme += createUsageSection(storeCtx);

      return {
        printInfo: 'Created readme usage section'
      };
    }
  });

  task.children.push({
    type: 'task',
    description: 'create readme build section',
    task: (storeCtx)=> {
      storeCtx.readme += createBuildSection();

      return {
        printInfo: 'Created readme build section'
      };
    }
  });

  if (store.answers.useMultiEnv) {
    task.children.push({
      type: 'task',
      description: 'create readme multienv section',
      task: (storeCtx)=> {
        storeCtx.readme += createMultiEnvSection();

        return {
          printInfo: 'Created readme multienv section'
        };
      }
    });
  }

  task.children.push({
    type: 'task',
    description: 'create readme devtools section',
    task: (storeCtx)=> {
      storeCtx.readme += createDevToolsSection(storeCtx);

      return {
        printInfo: 'Created readme devtools section'
      };
    }
  });

  if (store.answers.useEslint) {
    task.children.push({
      type: 'task',
      description: 'create readme eslint section',
      task: (storeCtx)=> {
        storeCtx.readme += createEslintSection(storeCtx);

        return {
          printInfo: 'Created readme eslint section'
        };
      }
    });
  }

  if (store.answers.useJest) {
    task.children.push({
      type: 'task',
      description: 'create readme test section',
      task: (storeCtx)=> {
        storeCtx.readme += createTestSection(storeCtx);

        return {
          printInfo: 'Created readme test section'
        };
      }
    });
  }

  task.children.push({
    type: 'task',
    description: 'create readme docs section',
    task: (storeCtx)=> {
      storeCtx.readme += createDocumentationSection(storeCtx);

      return {
        printInfo: 'Created readme docs section'
      };
    }
  });

  if (store.answers.useCommitizen) {
    task.children.push({
      type: 'task',
      description: 'create readme contributing section',
      task: (storeCtx)=> {
        storeCtx.readme += createContributingSection();

        return {
          printInfo: 'Created readme contributing section'
        };
      }
    });
  }

  task.children.push({
    type: 'task',
    description: 'create readme configuration section',
    task: (storeCtx)=> {
      storeCtx.readme += createConfigurationSection();

      return {
        printInfo: 'Created readme configuration section'
      };
    }
  });

  if (store.answers.repoMaintainers && store.answers.repoMaintainers !== '') {
    task.children.push({
      type: 'task',
      description: 'create readme maintainers section',
      task: (storeCtx)=> {
        storeCtx.readme += createMaintainersSection(storeCtx);

        return {
          printInfo: 'Created readme maintainers section'
        };
      }
    });
  }

  task.children.push({
    type: 'task',
    description: 'create readme footer section',
    task: (storeCtx)=> {
      storeCtx.readme += createReadmeFooter(storeCtx);

      return {
        printInfo: 'Created readme footer section'
      };
    }
  });

  store.addTask(task);
  store.addTask({
    type: 'batch',
    description: 'Write README.md file',
    children: [
      {
        type: 'task',
        description: 'writing README.md file to project directory',
        task: (storeCtx)=> {
          fs.writeFileSync(`${storeCtx.workingDir}/README.md`, storeCtx.readme);

          return {
            printInfo: `Wrote README.md to ${storeCtx.workingDir}/README.md`,
            printSuccess: storeCtx.readme
          };
        }
      }
    ]
  });
};
