import { runLoadTest, LoadTestResponse, LoadTestOptions} from '@examples/loadtest-common';

const KEY_PREFIX_ROUTE = '/keyprefix';

export const testGlobalKeyprefix = async ( url: string): Promise<boolean> => {
  const options: LoadTestOptions  = {
    url: `${url}${KEY_PREFIX_ROUTE}/global`,
    maxRequests: 1,
    maxSeconds: 2,
    timeout: 300,
    concurrency:1
  };
  try{
    const response: LoadTestResponse  = await runLoadTest( options );

    return (response.totalRequests === 1 && response.totalErrors ===  0);
  }catch( err ){
    // tslint:disable-next-line: no-console
    console.log( `Unexpected error testing points consumed ${err}`)
    return false;
  }
}

export const testUniqueKeyprefix = async ( url: string): Promise<boolean> => {
  const options: LoadTestOptions  = {
    url: `${url}${KEY_PREFIX_ROUTE}/unique`,
    maxRequests: 5,
    maxSeconds: 2,
    timeout: 300,
    concurrency:5
  };
  try{
    const response: LoadTestResponse  = await runLoadTest( options );

    return (response.totalRequests === 5 && response.totalErrors ===  0);
  }catch( err ){
    // tslint:disable-next-line: no-console
    console.log( `Unexpected error testing points consumed ${err}`)
    return false;
  }
}

