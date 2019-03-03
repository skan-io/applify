"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEslintConfig = void 0;

const createEslintConfig = () => `root: true

extends:
  - '@skan-io/eslint-config-react'
`;

exports.createEslintConfig = createEslintConfig;