
export const property = (obj, name)=> {
  if (obj) {
    return obj[name];
  }

  return undefined;
};
