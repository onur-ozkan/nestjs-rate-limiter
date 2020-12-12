import { PointsController } from './points.controller';
import { testBelowMaximumPoints, testExceedingMaximumPoints } from '@examples/rate-limiter-points-test';

const BASE_URL  = 'http://localhost:3333/api';

// jest.useFakeTimers();
const wait = (timeToDelay) => new Promise((resolve) => setTimeout(resolve, timeToDelay));

describe('PointsController',() => {

  describe('points configuration',() => {
    beforeEach( async () => {
      console.log( setTimeout );

      try{
        
        await wait(200);
        console.log('Done waiting');
      }catch(err){
        console.log(err);
      }
    })
    it('should verify successful call below maximum points', async () => {

      try {
        //jest.useRealTimers();
        const response = await testBelowMaximumPoints(BASE_URL);

        console.log( 'res', response);
        expect( true ).toBeTruthy();
      } catch (err) {
        // tslint:disable-next-line: no-console
        console.log(err);
        expect(err).toBeUndefined();
      }
    });
  });
});
