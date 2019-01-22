import {addCustomResource} from '../resources';
import {printSuccess, printError, printWarning} from '../print';
import {shellExec} from '../exec';
import {
  parseDescription,
  getScopedProject,
  updatePackageWithInfo
} from './utils';


/* eslint no-console: 0 */


const getNpmInitJson = async ()=> {
  try {
    const {stdout, stderr} = await shellExec(`npm init -y --force`);

    const outputstring = stdout.replace(
      `Wrote to ${process.cwd()}/package.json:\n\n`, ''
    );

    if (stderr.includes('npm WARN using --force')) {
      printWarning(stderr);
    } else if (stderr) {
      printError(stderr);
    }

    return JSON.parse(outputstring);
  } catch (err) {
    printError(err);
    throw new Error(err);
  }
};


export const initializePackageManager =
  // eslint-disable-next-line
  async (pkgManager, projectName, orgScope, projectDescription, repoOwner)=> {
    if (pkgManager === 'npm') {
      const scopedProject = getScopedProject(orgScope, projectName);

      const pkg = await getNpmInitJson();

      const newPkg = updatePackageWithInfo(
        pkg,
        scopedProject,
        parseDescription(projectDescription, projectName),
        repoOwner,
        projectName
      );

      // eslint-disable-next-line
      const json = JSON.stringify(newPkg, null, 4);

      addCustomResource('package.json', json);

      printSuccess('------ Wrote NPM package.json ------');
      printSuccess(json);
    }
  };
