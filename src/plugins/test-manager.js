import fs from 'fs';
import {join} from 'path';
import {STEP_COMPLETE} from '../events';
import {checkFields} from './utils';
import {printInfo, printDim} from '../print';
import {createJestConfig} from './create-jest-config';
import {addResourceFromTemplate} from './utils';

/* eslint max-len: 0 */


const COVERAGE_PERCENTAGE = 100;

export const requiredAnswers = [
  {question: 'Would you like to use jest testing: ', field: 'useJest'},
  {question: 'Would you like to use enzyme testing: ', field: 'useEnzyme'},
  {
    question: 'Would you like to use coverage checks: ',
    field: 'useCodeCoverage'
  },
  {question: 'Statements %: ', field: 'statementsPercentageCoverage'},
  {question: 'Functions %: ', field: 'functionsPercentageCoverage'},
  {question: 'Branches %: ', field: 'branchesPercentageCoverage'},
  {question: 'Lines %: ', field: 'linesPercentageCoverage'}
];

export const requiredFields = [];


const getShouldTest = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Would you like to use jest testing: ',
      'confirm',
      'useJest',
      true
    )
  );

  printInfo('\n-------- TEST DETAILS ---------\n');

  await store.runQuestions();
};

const getShouldCoverageAndEnzyme = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Would you like to use enzyme testing: ',
      'confirm',
      'useEnzyme',
      true
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Would you like to use coverage checks: ',
      'confirm',
      'useCodeCoverage',
      true
    )
  );

  await store.runQuestions();
};

const getCoverageDetails = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Statements %: ',
      'input',
      'statementsPercentageCoverage',
      COVERAGE_PERCENTAGE
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Functions %: ',
      'input',
      'functionsPercentageCoverage',
      COVERAGE_PERCENTAGE
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Branches %: ',
      'input',
      'branchesPercentageCoverage',
      COVERAGE_PERCENTAGE
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Lines %: ',
      'input',
      'linesPercentageCoverage',
      COVERAGE_PERCENTAGE
    )
  );

  await store.runQuestions();
};

const runJestInstallationTasks = async (store)=> {
  const task = {
    type: 'batch',
    description: 'Install jest and enzyme dependencies',
    children: [
      {
        type: 'task',
        description: 'install skan-io jest base config',
        task: async (storeCtx)=> {
          if (!storeCtx.jestInstalled) {
            const output = await storeCtx.packageInstaller.install(
              '@skan-io/jest-config-base react-test-renderer'
            );

            storeCtx.jestInstalled = true;

            return output;
          }

          return {};
        }
      }
    ]
  };

  if (store.answers.useEnzyme) {
    task.children.push({
      type: 'task',
      description: 'install enzyme dependencies',
      task: async (storeCtx)=> {
        if (!storeCtx.enzymeInstalled) {
          const output = await storeCtx.packageInstaller.install(
            'enzyme enzyme-adapter-react-16'
          );

          storeCtx.enzymeInstalled = true;

          return output;
        }

        return {};
      }
    });
  }

  store.addTask(task);
};

const setNoCoverageAnswers = (store)=> {
  store.answers.statementsPercentageCoverage = 0;
  store.answers.functionsPercentageCoverage = 0;
  store.answers.branchesPercentageCoverage = 0;
  store.answers.linesPercentageCoverage = 0;
};

const writeJestConfigTask = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Write jest config',
    children: [
      {
        type: 'task',
        description: 'write jest.config.js',
        task: (storeCtx)=> {
          const jestPath = join(storeCtx.workingDir, 'jest.config.js');
          const jestConfig = createJestConfig(store);

          fs.writeFileSync(jestPath, jestConfig);

          return {
            printInfo: `Wrote ${jestPath}`,
            printSuccess: jestConfig
          };
        }
      }
    ]
  });
};

const createTestingSetupFiles = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Create jest setup files',
    children: [
      {
        type: 'task',
        description: 'create testing directory',
        task: (storeCtx)=> {
          const testingDir = join(storeCtx.appSrcDir, 'testing');
          let printSuccess = `Found ${testingDir}`;

          if (!fs.existsSync(testingDir)) {
            fs.mkdirSync(testingDir);
            printSuccess = `Created ${testingDir}`;
          }

          return {
            printInfo: `Find or create ${testingDir}`,
            printSuccess
          };
        }
      },
      {
        type: 'task',
        description: 'create serializer directory',
        task: (storeCtx)=> {
          const snapshotsDir = join(storeCtx.appSrcDir, 'testing', 'snapshots');

          if (!fs.existsSync(snapshotsDir)) {
            fs.mkdirSync(snapshotsDir);
          }

          const serializerDir = join(storeCtx.appSrcDir, 'testing', 'snapshots', 'serializer');
          let printSuccess = `Found ${serializerDir}`;

          if (!fs.existsSync(serializerDir)) {
            fs.mkdirSync(serializerDir);
            printSuccess = `Created ${serializerDir}`;
          }

          return {
            printInfo: `Find or create ${serializerDir}`,
            printSuccess
          };
        }
      },
      {
        type: 'task',
        description: 'copy testing template files',
        // eslint-disable-next-line max-statements
        task: (storeCtx)=> {
          addResourceFromTemplate('src/testing/mock-file.js');
          addResourceFromTemplate('src/testing/setup-framework.js');
          addResourceFromTemplate('src/testing/setup-framework.test.js');
          addResourceFromTemplate('src/testing/setup.js');
          addResourceFromTemplate('src/testing/snapshots/serializer/index.js');
          addResourceFromTemplate('src/testing/snapshots/serializer/index.test.js');
          addResourceFromTemplate('src/testing/snapshots/serializer/shallow.js');
          addResourceFromTemplate('src/testing/snapshots/serializer/shallow.test.js');
          addResourceFromTemplate('src/testing/snapshots/serializer/utils.js');
          addResourceFromTemplate('src/testing/snapshots/serializer/utils.test.js');
          addResourceFromTemplate(
            'src/testing/mock-scss.js',
            undefined,
            join(
              process.cwd(),
              'src',
              'testing',
              storeCtx.answers.styleChoice === 'sass'
                ? 'mock-scss.js'
                : 'mock-css.js'
            )
          );

          return {
            printInfo: `Copied test files to ${storeCtx.appSrcDir}/testing`
          };
        }
      }
    ]
  });
};

// eslint-disable-next-line max-statements
export const checkRestore = async (store)=> {
  const restoreSuccess = checkFields(
    store, 'Test', requiredAnswers, requiredFields
  );

  if (restoreSuccess) {
    printDim('\n-------- TEST DETAILS ---------\n', 'blue');

    for (const answer of requiredAnswers) {
      printDim(`${answer.question} ${store.answers[answer.field]}`, 'white');
    }
  } else {
    // eslint-disable-next-line no-use-before-define
    await init(store, undefined, false);
  }
};

// eslint-disable-next-line max-statements
export const init = async (store, config, restore=true)=> {
  if (
    restore
    && store.completedSteps.some((step)=> step === 'init:test')
  ) {
    await checkRestore(store);
  } else {

    await getShouldTest(store);

    if (store.answers.useJest) {
      await getShouldCoverageAndEnzyme(store);

      if (store.answers.useCodeCoverage) {
        await getCoverageDetails(store);
      } else {
        setNoCoverageAnswers(store);
      }
    } else {
      setNoCoverageAnswers(store);
    }

    store.emit(STEP_COMPLETE, 'init:test');
    store.completedSteps.push('init:test');
  }
};


export const run = async (store)=> {
  if (!store.completedSteps.some((step)=> step === 'run:test')) {
    if (store.answers.useJest) {
      await runJestInstallationTasks(store);
      await writeJestConfigTask(store);
      await createTestingSetupFiles(store);
    }
  }

  store.emit(STEP_COMPLETE, 'run:test');
  store.completedSteps.push('run:test');

  return ()=> Promise.resolve(null);
};
