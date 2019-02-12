import {sep} from 'path';
import {execute} from '../execute';
import {applifyError} from '../error';
import {
  NODE_VERSION_ERROR,
  PKGMGR_VERSION_ERROR,
  RESTORE_ERROR
} from '../error/error-codes';
import {printInfo, printWarning, printDim} from '../print';
import {STEP_COMPLETE} from '../events';
import {expectDefined} from './utils';


const NPM_VERSION_MIN = '6';
const YARN_VERSION_MIN = '1';
const NODE_VERSION_MIN = 'v10';


const getEnvironmentDetails = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Use npm or yarn: ',
      'choices',
      'packageManager',
      'npm',
      ['npm', 'yarn']
    )
  );

  await store.runQuestions();
};

const getNodeVersionCheckTask = ()=> ({
  type: 'task',
  description: 'checking node version',
  task: async (ctx)=> {
    const output = await execute({cmd: 'node -v', info: 'Node version'});
    const {result} = output;

    if (!result.stdout.startsWith(NODE_VERSION_MIN)) {
      throw applifyError(
        NODE_VERSION_ERROR.code,
        // eslint-disable-next-line
        `${NODE_VERSION_ERROR.message}: failed with ${result.stdout} (must be v10+)`
      );
    }
    if (result.stderr) {
      throw applifyError(
        NODE_VERSION_ERROR.code,
        // eslint-disable-next-line
        `${NODE_VERSION_ERROR.message}: failed with ${result.stderr}`
      );
    }

    ctx.nodeVersionConfirmed = true;
    return output;
  }
});

const runNpmCheck = async ()=> {
  const output = await execute({cmd: 'npm -v', info: 'NPM version'});
  const {result} = output;

  if (!result.stdout.startsWith(NPM_VERSION_MIN)) {
    throw applifyError(
      PKGMGR_VERSION_ERROR.code,
      // eslint-disable-next-line
      `${PKGMGR_VERSION_ERROR.message}: failed with ${result.stdout} (must be v6+)`
    );
  }
  if (result.stderr) {
    throw applifyError(
      PKGMGR_VERSION_ERROR.code,
      // eslint-disable-next-line
      `${PKGMGR_VERSION_ERROR.message}: failed with ${result.stderr}`
    );
  }

  return output;
};


const runYarnCheck = async ()=> {
  const output = await execute({cmd: 'yarn -v', info: 'Yarn version'});
  const {result} = output;

  if (!result.stdout.startsWith(YARN_VERSION_MIN)) {
    throw applifyError(
      PKGMGR_VERSION_ERROR.code,
      // eslint-disable-next-line
      `${PKGMGR_VERSION_ERROR.message}: failed with ${result.stdout} (must be v1+)`
    );
  }
  if (result.stderr) {
    throw applifyError(
      PKGMGR_VERSION_ERROR.code,
      // eslint-disable-next-line
      `${PKGMGR_VERSION_ERROR.message}: failed with ${result.stderr}`
    );
  }

  return output;
};

const getPackageManagerCheckTask = (store)=> ({
  type: 'task',
  description: `checking ${store.answers.packageManager} version`,
  task: async (ctx)=> {
    let output = null;
    const {packageManager} = store.answers;

    if (packageManager === 'npm') {
      output = await runNpmCheck();
    }
    if (packageManager === 'yarn') {
      output = await runYarnCheck();
    }

    ctx.packageManagerVersionConfirmed = true;
    return output;
  }
});

// eslint-disable-next-line
const checkEnvironment = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Checking shell environment',
    children: [
      getNodeVersionCheckTask(),
      getPackageManagerCheckTask(store)
    ]
  });

  await store.runTasks();
};

// eslint-disable-next-line
const getProjectDetails = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'What is the project name: ',
      'input',
      'projectName',
      // eslint-disable-next-line
      process.cwd().split(sep).pop()
    )
  );
  store.addQuestion(
    store.prompter.createQuestion(
      'What is the project scope: ',
      'input',
      'orgScope',
      // eslint-disable-next-line
      'none'
    )
  );
  store.addQuestion(
    store.prompter.createRuntimeQuestion(
      ()=> 'What is the project description:',
      ()=> 'input',
      ()=> 'projectDescription',
      (storeCtx)=>
        `A react boilerplate application for ${storeCtx.answers.projectName}`
    )
  );
  store.addQuestion(
    store.prompter.createQuestion(
      'Who are the project maintainers (comma seperated):',
      'input',
      'projectMaintainers',
      'none'
    )
  );

  printInfo('\n-------- PROJECT DETAILS ---------\n');
  await store.runQuestions();
};

// eslint-disable-next-line max-statements
export const checkRestore = async (store)=> {
  const answers = [
    {question: 'Use npm or yarn: ', field: 'packageManager'},
    {question: 'What is the project name: ', field: 'projectName'},
    {question: 'What is the project scope: ', field: 'orgScope'},
    {question: 'What is the project description:', field: 'projectDescription'},
    {
      question: 'Who are the project maintainers (comma seperated):',
      field: 'projectMaintainers'
    }
  ];
  const data = ['nodeVersionConfirmed', 'packageManagerVersionConfirmed'];
  let restoreSuccess = true;

  for (const answer of answers) {
    if (!expectDefined(store.answers[answer.field])) {
      printWarning(
        // eslint-disable-next-line
        `Project plugin required ${answer.field} to be defined - reinitialising...`
      );
      restoreSuccess = false;
      break;
    }
  }
  for (const field of data) {
    if (!expectDefined(store[field])) {
      printWarning(
        `Project plugin required ${field} to be defined - reinitialising...`
      );
      restoreSuccess = false;
      break;
    }
  }

  if (restoreSuccess) {
    printDim('\n-------- PROJECT DETAILS ---------\n', 'blue');
    for (const answer of answers) {
      printDim(`${answer.question} ${store.answers[answer.field]}`, 'white');
    }
  } else {
    // eslint-disable-next-line
    await init(store);
  }
};

// Initialise the project details, check for package manager,
// check node version
export const init = async (store)=> {
  if (store.completedSteps.some((step)=> step === 'init:project')) {
    await checkRestore(store);
  } else {
    await getEnvironmentDetails(store);
    await checkEnvironment(store);
    await getProjectDetails(store);

    store.emit(STEP_COMPLETE, 'init:project');
    store.completedSteps.push('init:project');
  }
};