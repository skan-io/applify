import fs from 'fs';
import {join} from 'path';
import chalk from 'chalk';
import {shellExec} from './exec';
import {parseDescription} from './utils';


/* eslint no-console: 0 */


export const initializePackageManager =
  // eslint-disable-next-line
  async (pkgManager, projectName, orgScope, projectDescription, repoOwner)=> {
    if (pkgManager === 'npm') {
      const scopedProject = orgScope === 'none'
        ? null
        : `@${orgScope}/${projectName}`;

      const {stdout, stderr} = await shellExec(`npm init -y --force`);

      const outputstring = stdout.replace(
        `Wrote to ${process.cwd()}/package.json:\n\n`, ''
      );

      const pkg = JSON.parse(outputstring);
      const outFileName = join(process.cwd(), 'package.json');
      const description = parseDescription(projectDescription, projectName);
      const newPkg = {
        ...pkg.pkg,
        name: scopedProject ? scopedProject : projectName,
        version: '0.0.0-semantically-released',
        private: false,
        description,
        license: 'MIT',
        engines: {
          node: '>=6.2.0'
        },
        scripts: undefined,
        repository: repoOwner
          ? {
            type: 'git',
            url: `git+https://github.com/${repoOwner}/${projectName}.git`
          }
          : undefined,
        bugs: repoOwner
          ? {
            url: `https://github.com/${repoOwner}/${projectName}/issues`
          }
          : undefined,
        homepage: repoOwner
          ? `https://github.com/${repoOwner}/${projectName}#readme`
          : undefined
      };

      // eslint-disable-next-line
      const json = JSON.stringify(newPkg, null, 4);
      console.log(chalk.green('------ Wrote NPM package.json ------'));
      console.log(chalk.green(json));

      if (stderr.includes('npm WARN using --force')) {
        console.log(chalk.yellow(stderr));
      } else if (stderr) {
        console.log(chalk.red(stderr));
      }

      fs.writeFileSync(outFileName, json);
    }
  };
