import commander from 'commander';
// import ApplifyPrompterPlugin from './plugins/prompter';
// import ApplifyTaskerPlugin from './plugins/tasker';
import ApplifyProjectPlugin from './plugins/project';
import ApplifySourcePlugin from './plugins/source';
import ApplifyPackagePlugin from './plugins/package';
// import ApplifyLanguagePlugin from './plugins/language';
// import ApplifyBuildPlugin from './plugins/build';
// import ApplifyDeployPlugin from './plugins/deploy';
// import ApplifyTestPlugin from './plugins/test';
// import ApplifyStylePlugin from './plugins/style';
import pkgJson from './package.json';
import {printHeadingAndArt} from './print';
import init from './init';


const setGlobalPluginDefinitions = ()=> {
  // global.ApplifyPrompterPlugin = ApplifyPrompterPlugin;
  // global.ApplifyTaskerPlugin = ApplifyTaskerPlugin;
  global.ApplifyProjectPlugin = ApplifyProjectPlugin;
  global.ApplifySourcePlugin = ApplifySourcePlugin;
  global.ApplifyPackagePlugin = ApplifyPackagePlugin;
  // global.ApplifyLanguagePlugin = ApplifyLanguagePlugin;
  // global.ApplifyBuildPlugin = ApplifyBuildPlugin;
  // global.ApplifyDeployPlugin = ApplifyDeployPlugin;
  // global.ApplifyTestPlugin = ApplifyTestPlugin;
  // global.ApplifyStylePlugin = ApplifyStylePlugin;
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
