import {printAnswer} from '../utils';


const COVERAGE_PERCENTAGE = 100;


export const useCodeCoverage = async (store, defaultAnswer)=> {
  const question = 'Use code coverage: ';

  if (store.answers.useCodeCoverage === undefined) {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'confirm',
        'useCodeCoverage',
        defaultAnswer || true
      )
    );

    await store.runQuestions();
  } else {
    printAnswer(question, store.answers.useCodeCoverage);
  }
};

export const statementsPercentageCoverage = async (store, defaultAnswer)=> {
  const question = 'Statements %: ';

  if (store.answers.statementsPercentageCoverage) {
    printAnswer(question, store.answers.statementsPercentageCoverage);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'statementsPercentageCoverage',
        defaultAnswer || COVERAGE_PERCENTAGE,
        undefined,
        (input)=> {
          // eslint-disable-next-line
          if (!input || !Number.isInteger(input) || input > 100 || input < 0) {
            return 'Please enter a number between 0 and 100';
          }
          return true;
        }
      )
    );

    await store.runQuestions();
  }
};

export const functionsPercentageCoverage = async (store, defaultAnswer)=> {
  const question = 'Functions %: ';

  if (store.answers.functionsPercentageCoverage) {
    printAnswer(question, store.answers.functionsPercentageCoverage);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'functionsPercentageCoverage',
        defaultAnswer || COVERAGE_PERCENTAGE,
        undefined,
        (input)=> {
          // eslint-disable-next-line
          if (!input || !Number.isInteger(input) || input > 100 || input < 0) {
            return 'Please enter a number between 0 and 100';
          }
          return true;
        }
      )
    );

    await store.runQuestions();
  }
};

export const branchesPercentageCoverage = async (store, defaultAnswer)=> {
  const question = 'Branches %: ';

  if (store.answers.branchesPercentageCoverage) {
    printAnswer(question, store.answers.branchesPercentageCoverage);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'branchesPercentageCoverage',
        defaultAnswer || COVERAGE_PERCENTAGE,
        undefined,
        (input)=> {
          // eslint-disable-next-line
          if (!input || !Number.isInteger(input) || input > 100 || input < 0) {
            return 'Please enter a number between 0 and 100';
          }
          return true;
        }
      )
    );

    await store.runQuestions();
  }
};

export const linesPercentageCoverage = async (store, defaultAnswer)=> {
  const question = 'Lines %: ';

  if (store.answers.linesPercentageCoverage) {
    printAnswer(question, store.answers.linesPercentageCoverage);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'linesPercentageCoverage',
        defaultAnswer || COVERAGE_PERCENTAGE,
        undefined,
        (input)=> {
          // eslint-disable-next-line
          if (!input || !Number.isInteger(input) || input > 100 || input < 0) {
            return 'Please enter a number between 0 and 100';
          }
          return true;
        }
      )
    );

    await store.runQuestions();
  }
};
