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
    .option('--log', 'Log task output')
    .option('--reset', 'Reset any saved applify variables')
    .option('--config', 'Use a config file')
    .action(async (cmd)=> {

      global.log = cmd.log;

      if (cmd.reset) {
        // TODO delete the .applify directory
        console.log('reset true');
      }
      if (cmd.config) {
        // TODO read config from applify.config.js or applify.config.json
        console.log('config true');
      }

      await printHeadingAndArt();
      await init();
    });

  await program.parse(argv);
};

export default run;
