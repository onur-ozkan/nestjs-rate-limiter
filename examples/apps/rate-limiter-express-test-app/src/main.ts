import { testBelowMaximumPoints, testExceedingMaximumPoints, testBlockLocalhost, testBlockNonLocalhost, testWhiteListLocalhost, testRestrictLocalhost } from '@examples/rate-limiter-points-test';
import * as assert from 'assert';

const BASE_URL  = 'http://localhost:3333/api';

const execute = async () => {
    try{

        console.log( 'Start Running tests');
        assert (await testBelowMaximumPoints(BASE_URL) );
        console.log( 'Start Maxiumum Points');

        assert (await testExceedingMaximumPoints(BASE_URL) );


        assert ( await testBlockLocalhost(BASE_URL));

        console.log( 'Start Block Non Local host');
        assert ( await testBlockNonLocalhost(BASE_URL));

        console.log( 'Start Whitelist Local host');
        assert( await testWhiteListLocalhost(BASE_URL));


        assert( await testRestrictLocalhost(BASE_URL));
        console.log( 'End Testss');
        process.exit(1);
    }catch(err){
        process.exit(1);
    }
}

execute();

