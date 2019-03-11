import {stringify} from '../../utils/strings';
import {getScopedProject} from './helpers';
import {NODE_VERSION_MIN} from './checks';


// eslint-disable-next-line max-statements
export const createPackageJson = (store)=> {
  const json = {};
  json.name = getScopedProject(
    store.answers.orgScope, store.answers.projectName
  );
  json.private = store.answers.projectPrivate;
  json.version = store.answers.useCommitizen
    ? '0.0.0-semantically-released'
    : '1.0.0';
  json.description = store.answers.projectDescription;
  json.engines = {node: `>=${NODE_VERSION_MIN}.0.0`};
  json.repository = store.answers.useGit ? {
    type: 'git',
    url: `git+${store.gitHtmlUrl}`
  } : undefined;
  json.author = store.answers.projectAuthor;
  json.license = store.answers.projectLicense;
  json.homepage = store.answers.useGit
    ? `${store.gitHtmlUrl}#readme`
    : undefined;
  json.bugs = store.answers.useGit
    ? `${store.gitHtmlUrl}/issues`
    : undefined;
  json.publishConfig = store.answers.projectPrivate
    ? undefined
    : {access: 'public'};

  const stringifiedJson = stringify(json);

  return stringifiedJson;
};
