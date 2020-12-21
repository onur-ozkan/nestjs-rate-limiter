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
    const response: LoadTestResponse = await runLoadTest( options );

    console.log( 'Response for Blocked', response);

    return (response.totalRequests === 2 && response.totalErrors === 0 );
  }catch( err ){
    // tslint:disable-next-line: no-console
    console.log( `Unexpected error testing points consumed ${err}`)
    return false;
  }
}

