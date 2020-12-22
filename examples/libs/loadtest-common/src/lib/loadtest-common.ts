// tslint:disable-next-line: no-var-requires
const loadtest = require('loadtest');
import { LoadTestOptions, LoadTestResponse } from './loadtest-model'

export const runLoadTest = async ( options: LoadTestOptions ): Promise<LoadTestResponse> => {
  try{
    const resp = executeLoadTest( options );

    return resp;
  }catch( err ){
      throw err;
  }

};

const executeLoadTest = (options: LoadTestOptions): Promise<LoadTestResponse> => {
    return new Promise( (resolve, reject) => {
        loadtest.loadTest(options, (error: any, result: LoadTestResponse) => {
            // tslint:disable-next-line: no-console
            if (error){
                reject(`Got an error: ${error}`);
            } else {
                // tslint:disable-next-line: no-console
                resolve(result);
            }
        });
    });
}

export const  wait = async (ms): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }