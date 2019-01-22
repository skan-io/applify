import nodeFetch from 'node-fetch';
import {printInfo, printSuccess, printError} from './print';
import {HTTP_OK, HTTP_OK_ALT} from './http-codes';


export const createResponseError = (message, code)=> {
  const error = new Error(message);
  error.code = code;
  error.message = message;

  return error;
};


// eslint-disable-next-line
export const fetch = async (
  url, method, body, token=null, type=null, throwOnError=false
)=> {
  try {
    printInfo(`Attempting to ${method} ${body} to ${url} ...`);

    const response = await nodeFetch(url, {
      method,
      headers: {
        ['Content-Type']: type ? type : undefined,
        Authorization: token ? `bearer ${token}` : undefined
      },
      body
    });

    if (response.status === HTTP_OK || response.status === HTTP_OK_ALT) {
      printSuccess(`${method} to ${url} Successful`);
      return response;
    }

    throw createResponseError(
      `${method} to ${url} responded with ${response.status}`,
      response.status
    );

  } catch ({message, code}) {
    printError(`${code} ${message}`);

    if (throwOnError) {
      throw createResponseError(message, code);
    }
  }
};
