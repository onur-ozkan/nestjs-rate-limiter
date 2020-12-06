const loadtest = require('loadtest');
import { LoadTestOptions, LoadTestResponse } from './loadtest-model'

export const runLoadTest = async ( options: LoadTestOptions ): Promise<LoadTestResponse> => {
  // tslint:disable-next-line: no-console
  console.log( 'Calling run test');
  return new Promise( (resolve, reject) => {
      loadtest.loadTest(options, (error: any, result: LoadTestResponse) => {
          // tslint:disable-next-line: no-console
          console.log( 'Received Response')
          if (error){
              return reject(`Got an error: ${error}`);
          } else {
              // tslint:disable-next-line: no-console
              console.log('Tests run successfully');
              return resolve(result);
          }
      });
  });
};