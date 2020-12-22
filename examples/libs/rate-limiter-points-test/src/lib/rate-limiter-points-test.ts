import { runLoadTest, LoadTestResponse, LoadTestOptions} from '@examples/loadtest-common';

const POINTS_CONSUMED_ROUTE = '/points';

export const testBelowMaximumPoints = async ( url: string): Promise<boolean> => {
  const options: LoadTestOptions  = {
    url: `${url}${POINTS_CONSUMED_ROUTE}`,
    maxRequests: 2,
    maxSeconds: 3,
    timeout: 300
  };
  try{
    const response: LoadTestResponse = await runLoadTest( options );

    return (response.totalRequests === 2 && response.totalErrors === 0 );
  }catch( err ){
    // tslint:disable-next-line: no-console
    console.log( `Unexpected error testing points consumed ${err}`)
    return false;
  }
}

export const testExceedingMaximumPoints = async ( url: string): Promise<boolean> => {
  const options: LoadTestOptions  = {
    url: `${url}${POINTS_CONSUMED_ROUTE}`,
    maxRequests: 5,
    maxSeconds: 3,
    timeout: 300
  };
  try{
    const response: LoadTestResponse = await runLoadTest( options );
    return (response.totalRequests === 5 && response.totalErrors === 4 );
  }catch( err ){
    // tslint:disable-next-line: no-console
    console.log( `Unexpected error testing points consumed ${err}`)
    return false;
  }
}
