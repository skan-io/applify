
// Create consistent error messages
export const applifyError = (code, message)=> {
  const error = new Error(message);
  error.code = code;

  return error;
};
