import {prompt} from 'inquirer';
import {
  projectToolingQuestions,
  environmentQuestions,
  gitAccessQuestions,
  amplifyAccessQuestions,
  projectInfoQuestions
} from './questions';
import {runTasks} from '../tasks';
import {createInitTasks} from '../tasks/create';


// eslint-disable-next-line max-statements
export const runInit = async ()=> {
  const projectInfoAnswers = await prompt(projectInfoQuestions);
  const projectToolAnswers = await prompt(projectToolingQuestions);
  const environmentAnswers = await prompt(environmentQuestions);
  let sourceAccessAnswers = {};
  let amplifyAccessAnswers = {};

  if (projectToolAnswers.initSourceControl) {
    sourceAccessAnswers = await prompt(gitAccessQuestions);
  }

  if (projectToolAnswers.initAmplify) {
    amplifyAccessAnswers = await prompt(amplifyAccessQuestions);
  }

  const answers = {
    ...projectInfoAnswers,
    ...projectToolAnswers,
    ...environmentAnswers,
    ...sourceAccessAnswers,
    ...amplifyAccessAnswers
  };

  const tasks = await createInitTasks(answers);

  runTasks(tasks);
};
