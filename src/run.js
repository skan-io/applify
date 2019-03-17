import commander from 'commander';
import ApplifyPromptPlugin from './plugins/prompter';
import ApplifyTaskRunnerPlugin from './plugins/tasker';
import ApplifyProjectPlugin from './plugins/project';
import ApplifyPackagePlugin from './plugins/package';
import ApplifyGithubPlugin from './plugins/github';
import ApplifyBabelPlugin from './plugins/babel';
import ApplifyReactReduxPlugin from './plugins/react-redux';
import ApplifyHtmlPlugin from './plugins/html';
import ApplifyWebpackPlugin from './plugins/webpack';
import ApplifyJestEnzymePlugin from './plugins/jest-enzyme';
import ApplifyEslintPlugin from './plugins/eslint';
import ApplifyRemarkLintPlugin from './plugins/remark';
import ApplifyTravisIntegrationPlugin from './plugins/travis';
import ApplifySassPlugin from './plugins/sass';
import ApplifyStorybookPlugin from './plugins/storybook';
import pkgJson from './package.json';
import {printHeadingAndArt} from './print';
import init from './init';


// eslint-disable-next-line max-statements
const setGlobalPluginDefinitions = ()=> {
  global.ApplifyPromptPlugin = ApplifyPromptPlugin;
  global.ApplifyTaskRunnerPlugin = ApplifyTaskRunnerPlugin;
  global.ApplifyProjectPlugin = ApplifyProjectPlugin;
  global.ApplifyPackagePlugin = ApplifyPackagePlugin;
  global.ApplifyGithubPlugin = ApplifyGithubPlugin;
  global.ApplifyBabelPlugin = ApplifyBabelPlugin;
  global.ApplifyReactReduxPlugin = ApplifyReactReduxPlugin;
  global.ApplifyHtmlPlugin = ApplifyHtmlPlugin;
  global.ApplifyWebpackPlugin = ApplifyWebpackPlugin;
  global.ApplifyJestEnzymePlugin = ApplifyJestEnzymePlugin;
  global.ApplifyEslintPlugin = ApplifyEslintPlugin;
  global.ApplifyRemarkLintPlugin = ApplifyRemarkLintPlugin;
  global.ApplifyTravisIntegrationPlugin = ApplifyTravisIntegrationPlugin;
  global.ApplifySassPlugin = ApplifySassPlugin;
  global.ApplifyStorybookPlugin = ApplifyStorybookPlugin;
};

const run = async (argv)=> {
  const program = commander
    .version(pkgJson.version, '-v, --version')
    .description(pkgJson.description);

  program
    .command('init')
    .alias('i')
    .description('Create a new react project')
    .option('-l, --log', 'Log task output')
    .option('-r, --reset', 'Reset any saved applify variables')
    .action(async (cmd)=> {

      global.log = cmd.log;

      setGlobalPluginDefinitions();

      await printHeadingAndArt();
      await init(cmd.reset);
    });

  await program.parse(argv);
};

export default run;
