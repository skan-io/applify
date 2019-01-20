import fs from 'fs';
import {join} from 'path';
import chalk from 'chalk';
import {parseDescription, parseMaintainers} from './utils';


/* eslint no-console: 0 */


const readme = `
<DELETE THIS SECTION (FOR YOUR EYES ONLY!)
<If you have created this application using both amplify and git you will:
<1. Have 3 environments (master, test, dev)
<2. Each environment has a branch associated with it (master, test, dev)
<3. They are synchronized and currently using the \`default\` aws profile
<4. You can switch between environments using \`applify switch <env name>\`
<5. You can push and pull changes between environments using \`applify push/pull <env name>\`
<6. You can add \`amplify\` resources using standard amplify syntax
<7. You can publish your app using standard \`amplify\` syntax
<8. Standard amplify syntax look like \`amplify add auth\` or \`amplify publish\`

-------------

<p align="center"><img src='<?projectLogo?>' height='140' /></p>
<div style='text-align: center;'>
<h3> test-applify </h3>
</div>

<p align="center">
<b>
:zap: some brand new app
</b>
</p>

-------------

<p align="center">
  <a><img src="https://img.shields.io/badge/release-alpha-yellow.svg?style=flat-square" alt="Build Status"></a>
  <a href="https://github.com/RichardLitt/standard-readme"><img src="https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square" alt="contributions welcome"></a>
  <a><img src="https://img.shields.io/badge/frontend-react-blue.svg?style=flat-square"></a>
  <a><img src="https://img.shields.io/badge/backend-aws-orange.svg?style=flat-square" alt="code style: prettier"></a>
  <a><img src="https://img.shields.io/badge/api-graphql-purple.svg?style=flat-square"></a>
  <a><img src="https://img.shields.io/badge/ui-storybook-lightgrey.svg?style=flat-square"></a>
</p>

<p> &nbsp; </p>

:book: Read the [Quick Start Guide](https://enter-your-docs-guide-url.com)

:rocket: [Try it out](https://enter-your-site-url.com)

:hatched_chick: Current status: **Alpha**

:tractor: **[Roadmap](https://enter-your-roadmap-url.com)**

<p> &nbsp; </p>

## Table of Contents

- [Security](#security)
- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Multi Environment Support](#multi-environment)
- [Build & Package](#build-and-package)
- [Dev Tools](#dev-tools)
- [ESLint](#eslint-installation)
- [Testing](#running-tests)
- [Contributing](#contributing)
- [App Configuration](#configuration)
- [Documentation](#documentation)
- [Maintainers](#maintainers)
- [Under The Hood](#under-the-hood)
- [Disclaimer](#disclaimer)
- [License](#license)

## Security

Unauthorised access to this repository, any of its contents is prohibited.
Permission must be explicitly given from a maintainer.

Do not copy or share this repository, its url, or any of its downloadable
content unless specified by the license.

Please refer to the [LICENSE](./LICENSE)

## Install

Clone the repo and install dependencies:

> *Caveat* - requires node version >= 10, use:
>
> \`\`\`bash
> nvm use 10
> \`\`\`

> Make sure to use the latest version of npm:
> \`\`\`bash
> npm i -g npm
> \`\`\`
>

>**Note:**
> If you upgrade from previous versions of node or npm you may have to
> clear out your \`node_modules\` and the npm caches:
> \`\`\`bash
> rm -rf node_modules
> npm cache clean --force
> \`\`\`

\`\`\`bash
  git clone git@github.com:<?repoOwner?>/<?projectName?>.git
  cd <?projectName?>
  npm ci
  npx run
\`\`\`

## Usage

To start the application in your development environment:

\`\`\`bash
npx run
\`\`\`

>This will run both \`webpack\` and \`storybook\` servers.
>Application can be viewed on \`localhost:8080\`
>Storybook stories can be view on \`localhost:8000\`

This runs [webpack's dev server](https://webpack.js.org/configuration/dev-server/)
with live reloading enabled. You can find it's configuration in [webpack.config.babel.js](./webpack.config.babel.js).

Note: If you need to start a dev server supporting all production browsers
please run \`npx run config --node-env=production\`.

## Multi environment

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
\`\`\`

## Build and Package

To run a build use:

\`\`\`bash
  npx run build
\`\`\`

This will run a production build.

## Dev Tools

Check out some useful tools for development:

* [react-devtools](https://github.com/facebook/react-devtools)
* [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension)

## ESLint Installation

If for some odd reason, \`eslint\` does not work, you can add the \`node_modules/.bin\` to your path:

\`\`\`bash
export PATH="$PATH:./node_modules/.bin"
\`\`\`

## Running tests

Before committing and pushing code you should run the full suite of tests.
This includes linting with config from
[.eslintrc](./.eslintrc),
and running the unit-test using [jest](https://facebook.github.io/jest/)
with config from [jest.config.json](./jest.config.json):

\`\`\`bash
npx run test
\`\`\`

You will find code coverage results in \`build/cov\` including a HTML report:

\`\`\`bash
open ./build/cov/lcov-report/index.html
\`\`\`

#### Quickly Run Tests

NOTE: The next two are only for debugging. You must run the full test suite (as
described above) before committing/pushing to origin.

##### All tests (without coverage and using the test cache)

\`\`\`bash
npm run jest -- --verbose=false --collectCoverage=false --runInBand=false --cache=true
\`\`\`

##### Single test

\`\`\`bash
npm run jest -- --verbose=false --collectCoverage=false --runInBand=false --cache=true FULL_FILE_PATH
\`\`\`

where FULL_FILE_PATH is the path from the root to the test (e.g. - src/app/reducer.test.js)

NOTE: that if you are running on Windows, you have to specify double slashes for
the path (e.g. - src\\\\app\\\\reducer.test.js).

\`\`\`bash
npm run jest -- --verbose=false --collectCoverage=false --runInBand=false --cache=true src\\app\\reducer.test.js
\`\`\`

## Contributing
Pull requests and commits follow commitizen conventional commit guidelines.

\`\`\`bash
npx git-cz
\`\`\`

>It is reccommended to use the \`applify push\` and \`applify pull\`
>commands for updating environments, these will automate the git and amplify
>workflows and keep them in sync.

## Configuration

## Documentation

To run the local documentation generator and view the project documentation run:

\`\`\`bash
npx run docs
\`\`\`

This will build your code documentation (using JSDoc).  Once started, you can view the docs at http://localhost:3000

## Maintainers

<?projectMaintainers?>

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## Under the Hood

## Disclaimer

Any use of this software by any person will incur no liability on the owner of this software.

## License
[MIT](https://choosealicense.com/licenses/mit/)
`;


export const initializeReadme =
  // eslint-disable-next-line
  async (
    projectName, projectDescription, projectMaintainers, projectLogo, repoOwner
  )=> {
    const outFileName = join(process.cwd(), 'README.md');
    const readmeString = readme
      .replace(
        '<?projectName?>',
        projectName
      )
      .replace(
        '<?projectName?>',
        projectName
      )
      .replace(
        '<?projectDescription?>',
        parseDescription(projectDescription, projectName)
      )
      .replace(
        '<?projectLogo?>',
        projectLogo
      )
      .replace(
        '<?projectMaintainers?>',
        parseMaintainers(projectMaintainers)
      )
      .replace(
        '<?repoOwner?>',
        repoOwner
      );

    fs.writeFileSync(outFileName, readmeString);
    console.log('\n', chalk.green('Copied README.md'), '\n');
  };
