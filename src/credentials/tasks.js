import {checkAwsProfiles, createAwsProfiles} from './aws';


export const credentialTasks = {
  ['credentials/check-aws']: checkAwsProfiles,
  ['credentials/create-aws']: createAwsProfiles
};
