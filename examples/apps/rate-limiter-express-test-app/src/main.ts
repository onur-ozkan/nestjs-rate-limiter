import { wait } from '@examples/loadtest-common';
import {
    testBelowMaximumPoints,
    testExceedingMaximumPoints,
    testBlockLocalhost,
    testBlockNonLocalhost,
    testWhiteListLocalhost,
    testRestrictLocalhost,
    testExecEvenly,
    testNonExecEvenly,
    testGlobalKeyprefix,
    testUniqueKeyprefix
 } from '@examples/rate-limiter-points-test';

import * as assert from 'assert';

const BASE_URL  = 'http://localhost:3333/api';

const execute = async () => {
    try{
        assert (await testBelowMaximumPoints(BASE_URL) );

        assert (await testExceedingMaximumPoints(BASE_URL) );

        assert ( await testBlockLocalhost(BASE_URL));
        await wait(5000);

        assert ( await testBlockNonLocalhost(BASE_URL));

        assert( await testWhiteListLocalhost(BASE_URL));

        assert( await testRestrictLocalhost(BASE_URL));

        await wait(5000);
        assert( await testNonExecEvenly(BASE_URL));

        await wait(5000);
        assert( await testExecEvenly(BASE_URL));
        assert( await testGlobalKeyprefix(BASE_URL));

        assert( await testUniqueKeyprefix(BASE_URL));

        process.exit(1);
    }catch(err){
        process.exit(1);
    }
}

execute();

