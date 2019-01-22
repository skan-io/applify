import {execute} from '../exec';
import {printWarning} from '../print';


/* eslint max-len: 0 */


export const installNpxAndTools = async ()=> {
  printWarning('...please wait. This may take a few minutes...');

  await execute(
    `npm i -D npx-run rimraf`,
    'Installing npx-run and other helper tools'
  );
};
