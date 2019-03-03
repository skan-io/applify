
// Create consistent error messages
export const applifyError = (code, message, stack=null)=> {
  const stackMsg = stack ? `\n${stack}` : '';

  const error = new Error(`${message} ${stackMsg}`);
  error.code = code;

  return error;
};
