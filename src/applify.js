#!/usr/bin/env node
const path = require('path');
require('@babel/register')({
  extends: path.relative(
    process.cwd(), path.join(
      path.dirname(process.argv[1]), 'babel.config.js'
    )
  ),
  ignore: [/node_modules/]
});
const run = require('./run');


export const main = async (process)=> {
  await run.default(process.argv);
};


/* istanbul ignore if */
if (require.main === module) {
  main(process);
}
