import fs from 'fs';
import {join, dirname} from 'path';

export const parseDescription = (description, name)=> {
  if (description.includes('<project name>')) {
    return description.replace('<project name>', name);
  }

  return description;
};

export const parseMaintainers = (maintainers)=> {
  if (maintainers === 'none') {
    return '';
  }

  const usernames = maintainers.split(',');
  let maintainerString = '';

  for (const name of usernames) {
    const whiteSpaceFreeName = name.replace(/\s/g, '');
    const attribute =
      `[@${whiteSpaceFreeName}](https://github.com/${whiteSpaceFreeName})\n`;
    maintainerString += attribute;
  }

  return maintainerString;
};

// eslint-disable-next-line
export const createAmplifyInitScriptWithEnv = (env)=> {
  const templateDir = join(dirname(process.argv[1]), 'templates');
  const tempDir = join(dirname(process.argv[1]), 'temp');
  const headlessInitScriptPath = join(templateDir, 'headless-amplify-init.sh');
  const scriptString = fs.readFileSync(headlessInitScriptPath, 'utf8');
  const tempScript = scriptString.replace('<?amplifyEnv?>', env);
  const tempScriptPath = join(tempDir, 'headless-amplify-init.sh');

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  fs.writeFileSync(tempScriptPath, tempScript);

  fs.chmodSync(tempScriptPath, '755');

  return tempScriptPath;
};
