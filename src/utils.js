
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
