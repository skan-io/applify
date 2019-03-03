"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stringify = exports.singleLine = void 0;

const trim = strings => strings.map(str => str.replace(/\n\s*/g, ''));
/**
 * Template tag to turn a multi-line template-string into a single line.
 *
 * example:
 * ```
 * console.log(
 *   singleLine`foo ${123}
 *     spam ham shrub`
 * )
 *
 * > 'foo 123 spam ham shrub'
 * ```
 */


const singleLine = (strings, ...parts) => String.raw({
  raw: trim(strings.raw)
}, ...parts);

exports.singleLine = singleLine;
const JSON_INDENT_SPACE = 4;

const stringify = json => JSON.stringify(json, null, JSON_INDENT_SPACE);

exports.stringify = stringify;