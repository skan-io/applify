

export const expectDefined = (path)=> {
  try {
    return path !== undefined;
  } catch {
    return false;
  }
}
