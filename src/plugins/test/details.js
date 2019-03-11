
const COVERAGE_PERCENTAGE = 100;


export const getShouldTest = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Would you like to use jest testing: ',
      'confirm',
      'useJest',
      true
    )
  );

  await store.runQuestions();
};

export const getShouldCoverageAndEnzyme = async (store)=> {
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

export const getCoverageDetails = async (store)=> {
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
