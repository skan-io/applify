import {printSuccess, printWarning, printError} from './print';


// Create consistent error messages
export const applifyError = (code, message)=> {
  const error = new Error(message);
  error.code = code;

  return error;
};

/**
 * Used as a try catch for task functions
 */
// eslint-disable-next-line max-statements
export const handle = async (func, args)=> {
  try {
    const {success, warning, error, pipe} = await func(args);

    if (global.log) {
      if (success) {
        printSuccess(success);
      }
      if (warning) {
        printWarning(warning);
      }
      if (error) {
        printError(error);
      }
    }

    return pipe;
  } catch (err) {

    if (global.log) {
      printError(err.message);
    }

    throw applifyError(err.code, err.message);
  }
};
