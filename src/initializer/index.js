import {prompt} from 'inquirer';
import {progress} from '../progress';
import {printHeadingAndArt} from '../print';
import {
  projectToolingQuestions,
  environmentQuestions,
  gitAccessQuestions,
  amplifyAccessQuestions,
  projectInfoQuestions
} from './questions';
import {runTasks} from '../tasks';
import {createInitTasks} from '../tasks/create';
import {runPreInitTasks} from './pre-init';


// eslint-disable-next-line max-statements
export const runInit = async ()=> {
  await printHeadingAndArt();
  await runPreInitTasks();

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
