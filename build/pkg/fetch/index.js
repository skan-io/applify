"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchWithHeaders = exports.fetch = exports.createResponseError = void 0;

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _httpCodes = require("./http-codes");

const createResponseError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  error.message = message;
  return error;
}; // eslint-disable-next-line


exports.createResponseError = createResponseError;

const fetch = async (url, method, body, token = null, type = null, accept, throwOnError = false) => {
  try {
    const response = await (0, _nodeFetch.default)(url, {
      method,
      headers: {
        Accept: accept,
        ['Content-Type']: type ? type : undefined,
        Authorization: token ? `bearer ${token}` : undefined
      },
      body
    });

    if (response.status === _httpCodes.HTTP_OK || response.status === _httpCodes.HTTP_OK_ALT) {
      return {
        printSuccess: `${method} to ${url} Successful`,
        printInfo: `Attempting to ${method} ${body} to ${url} ...`,
        response: response.json ? await response.json() : response
      };
    }

    throw createResponseError(`${method} to ${url} responded with ${response.status}`, response.status);
  } catch ({
    message,
    code
  }) {
    if (throwOnError) {
      throw createResponseError(message, code);
    }
  }
}; // eslint-disable-next-line max-params


exports.fetch = fetch;

const fetchWithHeaders = async (url, method, body, headers, throwOnError = false) => {
  try {
    const response = await (0, _nodeFetch.default)(url, {
      method,
      headers,
      body
    });

    if (response.status === _httpCodes.HTTP_OK || response.status === _httpCodes.HTTP_OK_ALT) {
      return {
        printSuccess: `${method} to ${url} Successful`,
        printInfo: `Attempting to ${method} ${body} to ${url} ...`,
        response: response.json ? await response.json() : response
      };
    }

    if (throwOnError) {
      throw createResponseError(`${method} to ${url} responded with ${response.status}`, response.status);
    }

    return response;
  } catch ({
    message,
    code
  }) {
    if (throwOnError) {
      throw createResponseError(message, code);
    }
  }
};

exports.fetchWithHeaders = fetchWithHeaders;