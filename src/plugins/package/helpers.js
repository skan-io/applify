

export const getScopedProject = (orgScope, projectName)=> (
  orgScope === 'none' || orgScope === undefined
    ? projectName
    // eslint-disable-next-line max-len
    : `@${orgScope.startsWith('@') ? orgScope.substr(1) : orgScope}/${projectName}`
);
