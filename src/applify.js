#!/usr/bin/env node

import run from './run';


export const main = async (process)=> {
  await run(process.argv);
};


/* istanbul ignore if */
if (require.main === module) {
  main(process);
}
