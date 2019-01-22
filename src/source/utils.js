import fs from 'fs';
import {join} from 'path';
import {addCustomResource} from '../resources';


export const generateCloses = (closes)=> {
  let closesString = '';

  for (const close of closes) {
    closesString += `#${close}, `;
  }

  return closesString.substring(0, closesString.length - 2);
};

export const generateBreaking = (breaking)=>
  (breaking ? 'BREAKING CHANGE' : '');

export const generateStandardCommitMessage =
  // eslint-disable-next-line
  (type, scope, message, closes, breaking)=> ({
    title: `${type}(${scope}): ${message}`,
    description: closes.length > 0
      ? `${generateCloses(closes)}\n${generateBreaking(breaking)}`
      : `${generateBreaking(breaking)}`
  });

export const storeAccessToken = (token)=> {
  addCustomResource('.applify/githubToken', token);
};

export const getAccessToken = ()=> {
  const applifyDir = join(process.cwd(), '.applify');
  const gitTokenFile = join(applifyDir, 'githubToken');

  if (fs.existsSync(gitTokenFile)) {
    return fs.readFileSync(gitTokenFile, 'utf8');
  }
};
