import {checkDirectory, createDirectory} from '.';


export const resourceTasks = {
  ['resources/check-applify']: checkDirectory('.applify'),
  ['resources/create-applify']: createDirectory('.applify')
};
