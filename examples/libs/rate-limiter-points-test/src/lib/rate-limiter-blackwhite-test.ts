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
    const response: LoadTestResponse  = await runLoadTest( options );

    return (response.totalRequests === 5 && response.totalErrors === 5 );
  }catch( err ){
    // tslint:disable-next-line: no-console
    console.log( `Unexpected error testing points consumed ${err}`)
    return false;
  }
}

export const testBlockNonLocalhost = async ( url: string): Promise<boolean> => {
  const options: LoadTestOptions  = {
    url: `${url}${BLACK_WHITE_ROUTE}/blockspecific`,
    maxRequests: 5,
    maxSeconds: 2,
    timeout: 300,
    concurrency:3
  };
  try{
    const response: LoadTestResponse  = await runLoadTest( options );

    return (response.totalRequests === 5 );
  }catch( err ){
    // tslint:disable-next-line: no-console
    console.log( `Unexpected error testing points consumed ${err}`)
    return false;
  }
}

export const testWhiteListLocalhost = async ( url: string): Promise<boolean> => {
  const options: LoadTestOptions  = {
    url: `${url}${BLACK_WHITE_ROUTE}/enablelocal`,
    maxRequests: 5,
    maxSeconds: 2,
    timeout: 300,
    concurrency:3
  };
  try{
    const response: LoadTestResponse  = await runLoadTest( options );

    return (response.totalRequests === 5 && response.totalErrors === 0 );
  }catch( err ){
    // tslint:disable-next-line: no-console
    console.log( `Unexpected error testing points consumed ${err}`)
    return false;
  }
}

export const testRestrictLocalhost = async ( url: string): Promise<boolean> => {
  const options: LoadTestOptions  = {
    url: `${url}${BLACK_WHITE_ROUTE}/restrictlocal`,
    maxRequests: 5,
    maxSeconds: 2,
    timeout: 300,
    concurrency:3
  };
  try{
    const response: LoadTestResponse  = await runLoadTest( options );

    return (response.totalRequests === 5);
  }catch( err ){
    // tslint:disable-next-line: no-console
    console.log( `Unexpected error testing points consumed ${err}`)
    return false;
  }
}