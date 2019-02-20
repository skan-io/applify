import {STEP_COMPLETE} from '../events';


const COVERAGE_PERCENTAGE = 100;


const checkRestore = async ()=> null;

const getShouldTest = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Use jest testing: ',
      'confirm',
      'useJest',
      true
    )
  );

  await store.runQuestions();
};

const getShouldCoverage = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Use coverage checks: ',
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
      'statementPercentageCoverage',
      COVERAGE_PERCENTAGE
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Functions %: ',
      'input',
      'functionPercentageCoverage',
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
  store.addTask({
    type: 'batch',
    description: 'Install jest testing',
    children: [
      {
        type: 'task',
        description: 'install skan-io jest base config',
        task: async (storeCtx)=> {
          if (!storeCtx.jestInstalled) {
            const output = await storeCtx.packageInstaller.install(
              '@skan-io/jest-config-base'
            );

            storeCtx.jestInstalled = true;

            return output;
          }

          return {};
        }
      }
    ]
  });
};

export const init = async (store)=> {
  if (store.completedSteps.some((step)=> step === 'init:test')) {
    await checkRestore(store);
  } else {

    await getShouldTest(store);

    if (store.answers.useJest) {
      await getShouldCoverage(store);

      if (store.answers.useCodeCoverage) {
        await getCoverageDetails(store);
      }

      await runJestInstallationTasks(store);
    }

    store.emit(STEP_COMPLETE, 'init:test');
    store.completedSteps.push('init:test');
  }
};

// TODO run - setup jest file, extend with react web app jest test requirements,
// create testing module
