import path from 'path';

export const projectToolingQuestions = [
  {
    type: 'list',
    name: 'initPkgManager',
    message: 'Use npm or yarn:',
    default: 'npm',
    choices: ['npm', 'yarn']
  },
  {
    type: 'confirm',
    name: 'initSourceControl',
    message: 'Use git:',
    default: 'true'
  },
  {
    type: 'confirm',
    name: 'initAmplify',
    message: 'Use amplify:',
    default: 'true'
  }
];

export const environmentQuestions = [
  {
    type: 'input',
    name: 'repoOwner',
    message: 'Who owns the project repository:'
  },
  {
    type: 'input',
    name: 'environmentNames',
    message:
      'What environments would you like (comma seperated envs):',
    default: 'master'
  }
];

export const gitAccessQuestions = [
  {
    type: 'input',
    name: 'gitAccessToken',
    message: 'Enter your github personal access token:'
  }
];

export const amplifyAccessQuestions = [
  {
    type: 'confirm',
    name: 'useSingleAwsProfile',
    message: 'Use a single aws profile:',
    default: true
  },
  {
    type: 'input',
    name: 'awsProfiles',
    message: 'Enter the aws profile(s) to use (comma seperated profile names):',
    default: 'default'
  }
];

export const projectInfoQuestions = [
  {
    type: 'input',
    name: 'projectName',
    message: 'What is the project name:',
    default: process.cwd()
      .split(path.sep)
      .pop()
  },
  {
    type: 'input',
    name: 'orgScope',
    message: 'What is the project scope:',
    default: 'none'
  },
  {
    type: 'input',
    name: 'projectDescription',
    message: 'What is the project description:',
    default: 'A react boilerplate app for <project name>'
  },
  {
    type: 'input',
    name: 'projectMaintainers',
    message: 'Who are the project maintainers (comma seperated usernames):',
    default: 'none'
  },
  {
    type: 'input',
    name: 'projectLogo',
    message: 'Url of the project logo (can be local):',
    default: './src/logo.png'
  }
];
