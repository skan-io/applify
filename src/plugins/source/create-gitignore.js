import {writeFileSync} from 'fs';


const getGitignoreString = ()=> `
# Storybook
.cache

# Dependency directory
node_modules
npm-debug.log
.idea
.DS_Store
.vscode

# Build artifacts
build

# Applify local temp and setup files
.applify
applify.config.js
applify.config.babel.js

# Test config
src/private-config.js
`;

export const rewriteGitIgnoreTask = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Rewrite .gitignore',
    children: [
      {
        type: 'task',
        description: 'rewrite .gitignore in project directory',
        task: (storeCtx)=> {
          const gitignore = getGitignoreString();
          writeFileSync(`${storeCtx.workingDir}/.gitignore`, gitignore);

          return {
            printInfo: `Rewrote ${storeCtx.workingDir}/.gitignore`,
            printSuccess: gitignore
          };
        }
      }
    ]
  });
};
