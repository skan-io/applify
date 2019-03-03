import commander from 'commander';
import pkgJson from './package.json';
import {printHeadingAndArt} from './print';
import init from './init';


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
    .option('-c, --config', 'Use a config file')
    .option('-d, --dev', 'Use development mode')
    .action(async (cmd)=> {

      global.log = cmd.log;

      await printHeadingAndArt();
      await init({
        devMode: cmd.dev,
        reset: cmd.reset,
        useConfig: cmd.config
      });
    });

  await program.parse(argv);
};

export default run;
