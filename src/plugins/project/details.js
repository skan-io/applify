import {sep} from 'path';
import {execute} from '../../execute';


export const getEnvironmentDetails = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Use npm or yarn: ',
      'list',
      'packageManager',
      'npm',
      ['npm', 'yarn']
    )
  );

  await store.runQuestions();
};

const getPackageAuthor = async (store)=> {
  try {
    if (store.answers.projectAuthor) {
      return store.answers.projectAuthor;
    }
    const {result} = await execute({
      cmd: 'npm profile get fullname',
      info: 'Get npm profile name'
    });

    return result.stdout.replace(/(\r\n|\n|\r)/gm, '');
  } catch (err) {
    return 'none';
  }
};

export const getProjectDetails = async (store)=> {
  const projectAuthor = await getPackageAuthor();

  store.addQuestion(
    store.prompter.createQuestion(
      'What is the project name: ',
      'input',
      'projectName',
      process.cwd()
        .split(sep)
        .pop()
    )
  );

  store.addQuestion(
    store.prompter.createRuntimeQuestion(
      (storeCtx)=>
        // eslint-disable-next-line max-len
        `What is the project scope (@example/${storeCtx.answers.projectName}): `,
      ()=> 'input',
      ()=> 'orgScope',
      ()=> 'none'
    )
  );

  store.addQuestion(
    store.prompter.createRuntimeQuestion(
      ()=> 'What is the project description: ',
      ()=> 'input',
      ()=> 'projectDescription',
      (storeCtx)=>
        storeCtx.answers.projectDescription ||
        `A react boilerplate application for ${storeCtx.answers.projectName}`
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Who is the project author: ',
      'input',
      'projectAuthor',
      projectAuthor
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Is this a private project: ',
      'confirm',
      'privatePackage',
      store.answers.privatePackage || true
    )
  );

  await store.runQuestions();

  if (!store.answers.privatePackage) {
    store.addQuestion(
      store.prompter.createQuestion(
        'Choose a license: ',
        'list',
        'projectLicense',
        store.answers.projectLicense || 'MIT',
        [
          'MIT',
          'ISC',
          'Apache-2.0',
          'GPL-3.0',
          'BSD-2-clause',
          'BSD-3-clause',
          'CC',
          'WTFPL',
          'UNLICENSE'
        ]
      )
    );
  }

  await store.runQuestions();
};
