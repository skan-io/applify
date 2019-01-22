
// eslint-disable-next-line
export const createInitTasks = async (answers)=> {
  const {
    initPkgManager, initSourceControl, initAmplify,
    repoOwner, environmentNames, gitAccessToken,
    useSingleAwsProfile, awsProfiles,
    projectName, orgScope, projectDescription, projectMaintainers,
    projectLogo
  } = answers;

  const tasks = [];

  // if (initSourceControl) {
  //   const environment = 'master';
  //
  //   tasks.push({
  //     type: 'initSourceControlManager',
  //     description: 'Initialising git source control...',
  //     args: [projectName, repoOwner, environment, gitAccessToken]
  //   });
  // }
  //
  // tasks.push({
  //   type: 'initPackageManager',
  //   description: 'Initialising package manager...',
  //   args: [initPkgManager, projectName, orgScope, projectDescription, repoOwner]
  // });
  //
  // tasks.push({
  //   type: 'addResourceReadme',
  //   description: 'Adding standard readme...',
  //   args: [
  //     projectName,
  //     projectDescription,
  //     projectMaintainers,
  //     projectLogo,
  //     repoOwner
  //   ]
  // });
  //
  // if (initSourceControl) {
  //   tasks.push({
  //     type: 'initCommitStandard',
  //     description: 'Initializing commitizen commit standard...',
  //     args: []
  //   });
  // }
  //
  // tasks.push({
  //   type: 'installNpx',
  //   description: 'Installing npx and helper tools...',
  //   args: []
  // });
  //
  // tasks.push({
  //   type: 'addResourceNpxScripts',
  //   description: 'Adding npx run scripts and libs...',
  //   args: []
  // });
  //
  // tasks.push({
  //   type: 'installBabelDeps',
  //   description: 'Installing babel dependencies...',
  //   args: []
  // });
  //
  // tasks.push({
  //   type: 'addResourceBabelConfig',
  //   description: 'Adding babel config...',
  //   args: []
  // });

  // tasks.push({
  //   type: 'installWebpackDeps',
  //   description: 'Installing webpack dependencies',
  //   args: []
  // });

  // if (initAmplify) {
  //   const environment = 'master';
  //   tasks.push({
  //     type: 'initGlobalBackend',
  //     description: 'Installing amplify cli globally...',
  //     args: []
  //   });
  //   tasks.push({
  //     type: 'initBackendManager',
  //     description: 'Initialising amplify...',
  //     args: [environment]
  //   });
  // }
  //

  // if (initSourceControl && !initAmplify) {
  //   const withGitIgnore = true;
  //   const branch = 'master';
  //   tasks.push({
  //     type: 'initSourceControlManager',
  //     description: 'Initialising git source control...',
  //     args: [projectName, repoOwner, branch, withGitIgnore]
  //   });
  // }
  //
  // if (initAmplify && !initSourceControl) {
  //   const environment = 'master';
  // tasks.push({
  //   type: 'initBackendManager',
  //   description: 'Initialising amplify...',
  //   args: [environment]
  // });
  // }
  //
  // if (initSourceControl && initAmplify) {
  //   tasks.push({
  //     type: 'initMultienvManager',
  //     description:
  //       'Initialising multi environment source control and amplify...',
  //     args: [projectName, repoOwner]
  //   });
  // }

  return tasks;
};
