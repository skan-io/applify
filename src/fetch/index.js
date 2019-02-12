import nodeFetch from 'node-fetch';
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
    const response = await nodeFetch(url, {
      method,
      headers: {
        ['Content-Type']: type ? type : undefined,
        Authorization: token ? `bearer ${token}` : undefined
      },
      body
    });

    if (response.status === HTTP_OK || response.status === HTTP_OK_ALT) {
      return {
        printSuccess: `${method} to ${url} Successful`,
        printInfo: `Attempting to ${method} ${body} to ${url} ...`,
        response: response.json ? await response.json() : response
      };
    }

    throw createResponseError(
      `${method} to ${url} responded with ${response.status}`,
      response.status
    );

  } catch ({message, code}) {
    if (throwOnError) {
      throw createResponseError(message, code);
    }
  }
};
