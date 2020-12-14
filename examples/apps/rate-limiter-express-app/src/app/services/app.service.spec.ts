import { Test } from '@nestjs/testing';

import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return "Welcome to rate-limiter-express-app!"', async () => {

      try{
        const data = await service.getData();
        expect(data).toEqual({
          message: 'Welcome to rate-limiter-express-app!',
        });
      }catch(err){
        expect(err).toBeUndefined();
      }
    });
  });
});
