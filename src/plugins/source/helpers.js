

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
