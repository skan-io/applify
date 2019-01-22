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
    .action(async ()=> await runInit());

  await program.parse(argv);
};

export default run;
