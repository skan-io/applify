import commander from 'commander';
import {runInit} from './initializer';
import pkgJson from './package.json';


const run = async (argv)=> {
  const program = commander
    .version(pkgJson.version, '-v, --version')
    .description(pkgJson.description);

  program
    .command('init')
    .alias('i')
    .description('Create a new react project')
    .option('--log', 'Log task output')
    .option('--reset', 'Reset any saved applify variables')
    .action(async (cmd)=> {
      global.log = cmd.log;

      if (cmd.reset) {
        // TODO delete the .applify directory
        console.log(cmd.reset);
      }

      await runInit();
    });

  await program.parse(argv);
};

export default run;
