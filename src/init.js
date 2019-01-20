import path from 'path';
import {prompt} from 'inquirer';
import {runTasks} from './tasks';

const initQuestions = [
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
  },
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

// eslint-disable-next-line
const createInitTasks = async ({
  initPkgManager, initSourceControl, initAmplify,
  projectName, orgScope, projectDescription, projectMaintainers, projectLogo
})=> {
  const tasks = [];
  let repoOwner = null;

  if (initSourceControl) {
    const answer = await prompt([{
      type: 'input',
      name: 'repoOwner',
      message: 'Who owns the project repository:'
    }]);

    repoOwner = answer.repoOwner;
  }

  tasks.push({
    type: 'initPackageManager',
    description: 'Initialising package manager...',
    args: [initPkgManager, projectName, orgScope, projectDescription, repoOwner]
  });

  tasks.push({
    type: 'initReadme',
    description: 'Initialising standard readme...',
    args: [
      projectName,
      projectDescription,
      projectMaintainers,
      projectLogo,
      repoOwner
    ]
  });

  if (initSourceControl && !initAmplify) {
    tasks.push({
      type: 'initSourceControl',
      description: 'Initialising git source control...',
      args: [projectName, repoOwner]
    });
  }

  if (initAmplify && !initSourceControl) {
    tasks.push({
      type: 'initAmplify',
      description: 'Initialising amplify...',
      args: [projectName, repoOwner]
    });
  }

  if (initSourceControl && initAmplify) {
    tasks.push({
      type: 'initSourceAmplified',
      description:
        'Initialising multi environment source control and amplify...',
      args: [projectName, repoOwner]
    });
  }

  return tasks;
};

export const runInit = async ()=> {
  const answers = await prompt(initQuestions);

  const tasks = await createInitTasks(answers);

  runTasks(tasks);
};
