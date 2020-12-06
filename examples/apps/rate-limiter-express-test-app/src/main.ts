import { testBelowMaximumPoints, testExceedingMaximumPoints } from '@examples/rate-limiter-points-test';

const BASE_URL  = 'http://localhost:3333/api';

const execute = async () => {
    try{
        const testBelowMaximumPointsSuccess = await testBelowMaximumPoints(BASE_URL);

        const testExceedingMaximumPointsSuccess = await testExceedingMaximumPoints(BASE_URL);
        process.exit(1);
    }catch(err){
        console.log( 'Err', err);
        process.exit(1);
    }
}

execute();

