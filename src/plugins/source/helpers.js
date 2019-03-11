import {execute} from '../../execute';

export const getLocalGitProfile = async (store)=> {
  try {
    if (store.answers.repoOwner) {
      return store.answers.repoOwner;
    }

    const {result} = await execute({
      cmd: 'git config user.name',
      info: 'Get git profile name'
    });

    return result.stdout.replace(/(\r\n|\n|\r)/gm, '');
  } catch (err) {
    return 'none';
  }
};

export const parseAndReorderBranches = (branches)=> {
  if (!branches.some((branch)=> branch === 'master')) {
    branches.push('master');
  }

  if (branches[0] !== 'master') {
    const tempBranch = branches[0];

    for (let i = 0; i < branches.length; i += 1) {
      if (branches[i] === 'master') {
        branches = branches.splice(i, 0, tempBranch);
      }
    }

    branches[0] = 'master';
  }

  return branches;
};
