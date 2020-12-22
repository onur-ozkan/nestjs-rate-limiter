import { runLoadTest, LoadTestResponse, LoadTestOptions} from '@examples/loadtest-common';

const EXEC_EVENLY_CONSUMED_ROUTE = '/exec';

export const testExecEvenly = async ( url: string): Promise<boolean> => {
  const options: LoadTestOptions  = {
    url: `${url}${EXEC_EVENLY_CONSUMED_ROUTE}/evenly`,
    maxRequests: 2,
    maxSeconds: 3,
    timeout: 300
  };
  try{
    const response: LoadTestResponse = await runLoadTest( options );
    console.log('Response', response);
    return (response.totalRequests === 2 && response.totalErrors === 0 );
  }catch( err ){
    // tslint:disable-next-line: no-console
    console.log( `Unexpected error testing points consumed ${err}`)
    return false;
  }
}

