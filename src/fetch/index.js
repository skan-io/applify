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
  url, method, body, token=null, type=null, accept, throwOnError=false
)=> {
  try {
    const response = await nodeFetch(url, {
      method,
      headers: {
        Accept: accept,
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

    if (throwOnError) {
      throw createResponseError(
        `${method} to ${url} responded with ${response.status}`,
        response.status
      );
    }

    return response.status;

  } catch ({message, code}) {
    if (throwOnError) {
      throw createResponseError(message, code);
    }
  }
};

// eslint-disable-next-line max-params
export const fetchWithHeaders = async (
  url, method, body, headers, throwOnError=false
)=> {
  try {
    const response = await nodeFetch(url, {
      method,
      headers,
      body
    });

    if (response.status === HTTP_OK || response.status === HTTP_OK_ALT) {
      return {
        printSuccess: `${method} to ${url} Successful`,
        printInfo: `Attempting to ${method} ${body} to ${url} ...`,
        response: response.json ? await response.json() : response
      };
    }

    if (throwOnError) {
      throw createResponseError(
        `${method} to ${url} responded with ${response.status}`,
        response.status
      );
    }

    return response;

  } catch ({message, code}) {
    if (throwOnError) {
      throw createResponseError(message, code);
    }
  }
};
