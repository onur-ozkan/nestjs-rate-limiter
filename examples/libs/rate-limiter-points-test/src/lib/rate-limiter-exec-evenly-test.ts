import { runLoadTest, LoadTestResponse, LoadTestOptions} from '@examples/loadtest-common';

const EXEC_EVENLY_CONSUMED_ROUTE = '/exec';

export const testNonExecEvenly = async ( url: string): Promise<boolean> => {
  const options: LoadTestOptions  = {
    url: `${url}${EXEC_EVENLY_CONSUMED_ROUTE}/notevenly`,
    maxRequests: 5,
    maxSeconds: 2,
    timeout: 0,
    concurrency:5
  };
  try{
    const response: LoadTestResponse = await runLoadTest( options );
    console.log('Not even Response', response);
    return (response.totalRequests === 5 && response.totalErrors === 0 && response.maxLatencyMs < 100 );
  }catch( err ){
    // tslint:disable-next-line: no-console
    console.log( `Unexpected error testing points consumed ${err}`)
    return false;
  }
}

export const testExecEvenly = async ( url: string): Promise<boolean> => {
  const options: LoadTestOptions  = {
    url: `${url}${EXEC_EVENLY_CONSUMED_ROUTE}/evenly`,
    maxRequests: 5,
    maxSeconds: 5,
    timeout: 0,
    concurrency: 5
  };
  try{
    const response: LoadTestResponse = await runLoadTest( options );

    return (response.totalRequests === 5 && response.totalErrors === 0 &&  response.maxLatencyMs > 1000);
  }catch( err ){
    // tslint:disable-next-line: no-console
    console.log( `Unexpected error testing points consumed ${err}`)
    return false;
  }
}

