
export const parseDescription = (description, name)=> {
  if (description.includes('<project name>')) {
    return description.replace('<project name>', name);
  }

  return description;
};

export const getScopedProject = (orgScope, projectName)=> (
  orgScope === 'none'
    ? projectName
    // eslint-disable-next-line max-len
    : `@${orgScope.startsWith('@') ? orgScope.substr(1) : orgScope}/${projectName}`
);

// eslint-disable-next-line max-params
export const updatePackageWithInfo = (
    pkg, scopedProject, description, repoOwner, projectName
)=> ({
  ...pkg.pkg,
  name: scopedProject,
  version: '0.0.0-semantically-released',
  private: false,
  description,
  license: 'MIT',
  engines: {
    node: '>=10.0.0'
  },
  scripts: undefined,
  main: undefined,
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
});
