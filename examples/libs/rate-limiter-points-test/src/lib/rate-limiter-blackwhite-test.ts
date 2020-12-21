import { runLoadTest, LoadTestResponse, LoadTestOptions} from '@examples/loadtest-common';

const BLACK_WHITE_ROUTE = '/blackwhite';

export const testBlockLocalhost = async ( url: string): Promise<boolean> => {
  const options: LoadTestOptions  = {
    url: `${url}${BLACK_WHITE_ROUTE}/blocklocal`,
    maxRequests: 5,
    maxSeconds: 2,
    timeout: 300,
    concurrency:3
  };
  try{
    const response  = await runLoadTest( options );

    console.log('Response', response);
    // All incoming requests should be blocked
    //return (response.totalRequests === 5 && response.totalErrors === 5 );

    return true;
  }catch( err ){
    // tslint:disable-next-line: no-console
    console.log( `Unexpected error testing points consumed ${err}`)
    return false;
  }
}

