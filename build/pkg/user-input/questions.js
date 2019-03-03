"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createQuestion = void 0;

// eslint-disable-next-line max-params
const createQuestion = (question, type, value, defaultValue, choices = []) => ({
  message: question,
  type,
  default: defaultValue,
  name: value,
  choices
});

exports.createQuestion = createQuestion;